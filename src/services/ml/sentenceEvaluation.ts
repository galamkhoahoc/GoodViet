import type { LocalVoiceResult } from './voiceModel.types';
import type { EraxTranscriptResult } from './speechModel.types';

export interface SentenceEvaluationResult {
  targetText: string;
  transcript: string;
  phonemes: string[];
  transcriptAccuracy: number;
  acousticConfidence: number;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  processingTimeMs: number;
  models: {
    phoneme: string;
    transcript: string;
    evaluator: string;
  };
}

export interface SentenceMetrics {
  transcriptAccuracy: number;
  acousticConfidence: number;
  baselineScore: number;
}

interface GemmaEvaluationPayload {
  score?: unknown;
  feedback?: unknown;
  strengths?: unknown;
  improvements?: unknown;
}

function clampScore(value: number) {
  return Math.round(Math.min(100, Math.max(0, value)));
}

function normalizeWords(value: string) {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('vi')
    .replace(/[“”"'.,!?;:()[\]{}…—–\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function editDistance(left: string[], right: string[]) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current.push(Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, substitution));
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

export function calculateSentenceMetrics(
  targetText: string,
  transcript: string,
  lingResult: LocalVoiceResult,
): SentenceMetrics {
  const targetWords = normalizeWords(targetText);
  const transcriptWords = normalizeWords(transcript);
  const distance = editDistance(targetWords, transcriptWords);
  const transcriptAccuracy = clampScore((1 - distance / Math.max(targetWords.length, transcriptWords.length, 1)) * 100);
  const rawConfidence = lingResult.confidence ?? 0;
  const acousticConfidence = clampScore((rawConfidence > 1 ? rawConfidence : rawConfidence * 100));
  return {
    transcriptAccuracy,
    acousticConfidence,
    baselineScore: clampScore(transcriptAccuracy * 0.68 + acousticConfidence * 0.32),
  };
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 3)
    : [];
}

function parseGemmaJson(raw: string): GemmaEvaluationPayload | null {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as GemmaEvaluationPayload;
  } catch {
    return null;
  }
}

export function buildSentenceEvaluationPrompt(
  targetText: string,
  transcript: EraxTranscriptResult,
  lingResult: LocalVoiceResult,
  metrics: SentenceMetrics,
) {
  const phonemes = lingResult.phonemes.map(item => item.token).join(' ');
  return `Bạn là trợ lý luyện phát âm tiếng Việt của GOODVIET. Hãy nhận xét ngắn gọn, tích cực và cụ thể dựa CHỈ trên dữ liệu nhận dạng cục bộ dưới đây.

Câu cần đọc: ${JSON.stringify(targetText)}
Văn bản Voice AI nhận dạng: ${JSON.stringify(transcript.text)}
Chuỗi âm vị LingWav2Vec2: ${JSON.stringify(phonemes)}
Độ khớp văn bản: ${metrics.transcriptAccuracy}/100
Độ tin cậy âm vị: ${metrics.acousticConfidence}/100
Điểm nền có thể tái lập: ${metrics.baselineScore}/100

Trả về đúng một JSON, không markdown:
{"score": số nguyên từ ${Math.max(0, metrics.baselineScore - 8)} đến ${Math.min(100, metrics.baselineScore + 8)}, "feedback":"2 câu tiếng Việt", "strengths":["tối đa 2 ý"], "improvements":["tối đa 2 ý"]}
Không chẩn đoán y khoa. Nếu dữ liệu không rõ, nói rõ cần thu lại ở nơi yên tĩnh.`;
}

export function createSentenceEvaluationResult(
  targetText: string,
  transcript: EraxTranscriptResult,
  lingResult: LocalVoiceResult,
  metrics: SentenceMetrics,
  gemmaOutput: string,
  processingTimeMs: number,
): SentenceEvaluationResult {
  const parsed = parseGemmaJson(gemmaOutput);
  const proposed = typeof parsed?.score === 'number' && Number.isFinite(parsed.score)
    ? parsed.score
    : metrics.baselineScore;
  const minimum = Math.max(0, metrics.baselineScore - 8);
  const maximum = Math.min(100, metrics.baselineScore + 8);
  const score = clampScore(Math.min(maximum, Math.max(minimum, proposed)));
  const feedback = typeof parsed?.feedback === 'string' && parsed.feedback.trim()
    ? parsed.feedback.trim()
    : score >= 80
      ? 'Bạn đọc khá sát câu mẫu và giữ âm tương đối rõ. Hãy duy trì nhịp đều ở lần đọc tiếp theo.'
      : score >= 60
        ? 'Bài đọc đã nhận dạng được phần lớn nội dung. Hãy đọc chậm hơn một chút và nhấn rõ từng âm cuối.'
        : 'Bản ghi chưa khớp rõ với câu mẫu. Hãy thử lại ở nơi yên tĩnh, đọc chậm và giữ khoảng cách microphone ổn định.';

  return {
    targetText,
    transcript: transcript.text,
    phonemes: lingResult.phonemes.map(item => item.token),
    transcriptAccuracy: metrics.transcriptAccuracy,
    acousticConfidence: metrics.acousticConfidence,
    score,
    feedback,
    strengths: stringArray(parsed?.strengths),
    improvements: stringArray(parsed?.improvements),
    processingTimeMs,
    models: {
      phoneme: 'tuanio/wav2vec2-base-finetune-vi_phone-non_freeze-spec_aug-500epoch',
      transcript: transcript.modelId,
      evaluator: 'google/gemma-4-E2B-it-qat-mobile-transformers',
    },
  };
}
