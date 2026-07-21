import { useCallback, useState } from 'react';
import { useLocalVoiceModel } from './useLocalVoiceModel';
import { useSpeechModel } from './useSpeechModel';
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
      
      const { apiClient } = await import('../services/api/apiClient');
      const response = await apiClient.post<{ success: boolean; result: string }>('/api/chat/evaluate', {
        prompt,
        history: [],
        context: 'sentence-evaluation',
      });
      const gemmaOutput = response.result;

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
      console.error('Sentence evaluation failed', caught);
      const message = 'Chưa thể phân tích bản ghi. Vui lòng kiểm tra tệp âm thanh và thử lại.';
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
    ? speechProgress * 0.9
    : stage === 'feedback'
      ? 0.95
      : stage === 'complete' ? 1 : 0;
  const detail = stage === 'speech'
    ? 'Đang nghe và đối chiếu bản thu với câu mẫu...'
    : stage === 'feedback'
      ? 'Đang tổng hợp điểm và gợi ý cải thiện...'
      : stage === 'complete'
        ? 'Đã hoàn tất đánh giá.'
        : error || 'Sẵn sàng đánh giá.';

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
  };
}
