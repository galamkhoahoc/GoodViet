import { useCallback, useEffect, useState } from 'react';
import { useLocalVoiceModel } from './useLocalVoiceModel';
import { useSpeechModel } from './useSpeechModel';
import { localTextModel } from '../services/ml/localTextModel';
import type { TextModelRuntimeState } from '../services/ml/textModel.types';
import {
  buildSentenceEvaluationPrompt,
  calculateSentenceMetrics,
  createSentenceEvaluationResult,
  type SentenceEvaluationResult,
} from '../services/ml/sentenceEvaluation';

export type SentenceEvaluationStage = 'idle' | 'speech' | 'feedback' | 'complete' | 'error';

export function useLocalSentenceEvaluation() {
  const ling = useLocalVoiceModel();
  const speechModel = useSpeechModel();
  const analyzeLing = ling.analyzeAsync;
  const resetLing = ling.reset;
  const transcribeErax = speechModel.transcribeAsync;
  const resetErax = speechModel.reset;
  const [stage, setStage] = useState<SentenceEvaluationStage>('idle');
  const [result, setResult] = useState<SentenceEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gemmaState, setGemmaState] = useState<TextModelRuntimeState>(() => localTextModel.getState());

  useEffect(() => localTextModel.subscribe(setGemmaState), []);

  const analyze = useCallback(async (blob: Blob, targetText: string) => {
    const startedAt = performance.now();
    setStage('speech');
    setResult(null);
    setError(null);
    const extension = blob.type.includes('wav') ? 'wav' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    const file = new File([blob], `goodviet-sentence-${Date.now()}.${extension}`, { type: blob.type || 'audio/webm' });

    try {
      const [lingResult, transcript] = await Promise.all([
        analyzeLing(file),
        transcribeErax(file),
      ]);
      const metrics = calculateSentenceMetrics(targetText, transcript.text, lingResult);
      setStage('feedback');
      const prompt = buildSentenceEvaluationPrompt(targetText, transcript, lingResult, metrics);
      let gemmaOutput = '';
      try {
        gemmaOutput = await localTextModel.generate([
          {
            role: 'user',
            content: 'Bạn đánh giá phát âm tiếng Việt cho người học. Luôn trả về đúng JSON theo yêu cầu và không thêm markdown.',
          },
          { role: 'assistant', content: '{"status":"ready"}' },
          { role: 'user', content: prompt },
        ], { maxNewTokens: 260 });
      } catch (generateError) {
        console.warn('WebGPU failed, falling back to cloud evaluation API', generateError);
        const { apiClient } = await import('../services/api/apiClient');
        const response = await apiClient.post<{ success: boolean; result: string }>('/api/chat/evaluate', {
          prompt,
          history: [
            { role: 'user', content: 'Bạn đánh giá phát âm tiếng Việt cho người học. Luôn trả về đúng JSON theo yêu cầu và không thêm markdown.' },
            { role: 'assistant', content: '{"status":"ready"}' }
          ]
        });
        gemmaOutput = response.result;
      }

      const completed = createSentenceEvaluationResult(
        targetText,
        transcript,
        lingResult,
        metrics,
        gemmaOutput,
        performance.now() - startedAt,
      );
      setResult(completed);
      setStage('complete');
      return completed;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Không thể chấm điểm bản ghi trên thiết bị.';
      setError(message);
      setStage('error');
      throw caught;
    }
  }, [analyzeLing, transcribeErax]);

  const reset = useCallback(() => {
    resetLing();
    resetErax();
    setStage('idle');
    setResult(null);
    setError(null);
  }, [resetErax, resetLing]);

  const speechProgress = (ling.progress + speechModel.progress) / 2;
  const progress = stage === 'speech'
    ? speechProgress * 0.62
    : stage === 'feedback'
      ? 0.62 + gemmaState.progress * 0.38
      : stage === 'complete' ? 1 : 0;
  const detail = stage === 'speech'
    ? `${speechModel.detail} LingWav2Vec2: ${ling.status}.`
    : stage === 'feedback'
      ? gemmaState.detail
      : stage === 'complete'
        ? 'Đã chấm điểm hoàn toàn trên thiết bị'
        : error || 'Sẵn sàng phân tích';

  return {
    stage,
    progress,
    detail,
    result,
    error,
    analyze,
    reset,
    lingStatus: ling.status,
    speechModelStatus: speechModel.status,
    gemmaStatus: gemmaState.status,
  };
}
