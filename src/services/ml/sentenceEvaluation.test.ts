import { describe, expect, it } from 'vitest';
import {
  calculateSentenceMetrics,
  createSentenceEvaluationResult,
} from './sentenceEvaluation';
import type { LocalVoiceResult } from './voiceModel.types';
import type { EraxTranscriptResult } from './erax.types';

const lingResult: LocalVoiceResult = {
  confidence: 0.8,
  phonemes: [{ token: 's' }, { token: 'a-0' }, { token: 'ŋ' }],
};

const transcript: EraxTranscriptResult = {
  text: 'Xin chào hôm nay',
  language: 'vi',
  processingTimeMs: 120,
  backend: 'wasm',
  modelId: 'test/erax-onnx',
};

describe('local sentence evaluation', () => {
  it('calculates a reproducible baseline from transcript and acoustic confidence', () => {
    const exact = calculateSentenceMetrics('Xin chào, hôm nay!', transcript.text, lingResult);
    expect(exact.transcriptAccuracy).toBe(100);
    expect(exact.acousticConfidence).toBe(80);
    expect(exact.baselineScore).toBe(94);

    const missingWord = calculateSentenceMetrics('Xin chào bạn hôm nay', transcript.text, lingResult);
    expect(missingWord.transcriptAccuracy).toBe(80);
    expect(missingWord.baselineScore).toBeLessThan(exact.baselineScore);
  });

  it('constrains Gemma score near the deterministic baseline', () => {
    const metrics = calculateSentenceMetrics('Xin chào hôm nay', transcript.text, lingResult);
    const result = createSentenceEvaluationResult(
      'Xin chào hôm nay',
      transcript,
      lingResult,
      metrics,
      '{"score":1,"feedback":"Đọc rõ.","strengths":["Nhịp đều"],"improvements":["Giữ âm cuối"]}',
      500,
    );
    expect(result.score).toBe(Math.max(0, metrics.baselineScore - 8));
    expect(result.feedback).toBe('Đọc rõ.');
    expect(result.models.transcript).toBe('test/erax-onnx');
  });

  it('falls back safely when Gemma does not return JSON', () => {
    const metrics = calculateSentenceMetrics('Xin chào hôm nay', transcript.text, lingResult);
    const result = createSentenceEvaluationResult(
      'Xin chào hôm nay', transcript, lingResult, metrics, 'not-json', 500,
    );
    expect(result.score).toBe(metrics.baselineScore);
    expect(result.feedback.length).toBeGreaterThan(20);
  });
});
