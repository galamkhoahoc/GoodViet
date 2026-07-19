import { CTC_BLANK_ID, VI_PHONE_LABELS } from '../../data/voicePhonemes';
import type { LocalVoicePhoneme, LocalVoiceResult } from './voiceModel.types';

type DecodedCtcResult = Pick<LocalVoiceResult, 'phonemes' | 'confidence'>;

interface ActiveSegment {
  tokenId: number;
  startFrame: number;
  endFrame: number;
  confidenceSum: number;
  frameCount: number;
}

interface FramePrediction {
  tokenId: number;
  confidence: number;
}

function validateInput(
  logits: ArrayLike<number>,
  frameCount: number,
  vocabSize: number,
  durationSeconds: number,
) {
  if (!Number.isInteger(frameCount) || frameCount <= 0) {
    throw new RangeError(`CTC frameCount must be a positive integer; received ${frameCount}.`);
  }

  if (!Number.isInteger(vocabSize) || vocabSize !== VI_PHONE_LABELS.length) {
    throw new RangeError(
      `CTC vocabSize must match the ${VI_PHONE_LABELS.length}-label phoneme vocabulary; received ${vocabSize}.`,
    );
  }

  const expectedLength = frameCount * vocabSize;
  if (logits.length !== expectedLength) {
    throw new RangeError(
      `Invalid CTC logits length: expected ${expectedLength} values for ${frameCount} frames, received ${logits.length}.`,
    );
  }

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new RangeError(`Audio duration must be a positive finite number; received ${durationSeconds}.`);
  }
}

/**
 * Returns the argmax token and its softmax probability for one frame.
 * Subtracting the maximum logit keeps the exponentials stable for large values.
 */
function predictFrame(
  logits: ArrayLike<number>,
  offset: number,
  vocabSize: number,
): FramePrediction {
  let tokenId = 0;
  let maxLogit = Number(logits[offset]);

  if (!Number.isFinite(maxLogit)) {
    throw new TypeError(`CTC logits must contain finite numbers; received ${maxLogit}.`);
  }

  for (let index = 1; index < vocabSize; index += 1) {
    const logit = Number(logits[offset + index]);
    if (!Number.isFinite(logit)) {
      throw new TypeError(`CTC logits must contain finite numbers; received ${logit}.`);
    }

    if (logit > maxLogit) {
      maxLogit = logit;
      tokenId = index;
    }
  }

  let denominator = 0;
  for (let index = 0; index < vocabSize; index += 1) {
    denominator += Math.exp(Number(logits[offset + index]) - maxLogit);
  }

  return {
    tokenId,
    confidence: 1 / denominator,
  };
}

/**
 * Greedily decodes flattened `[frames, vocabulary]` Wav2Vec2 CTC logits.
 * Consecutive repeats collapse into one phoneme, while blank ID 0 ends the
 * current segment so the same phoneme can be emitted again after a blank.
 */
export function decodeCtcLogits(
  logits: ArrayLike<number>,
  frameCount: number,
  vocabSize: number,
  durationSeconds: number,
): DecodedCtcResult {
  validateInput(logits, frameCount, vocabSize, durationSeconds);

  const phonemes: LocalVoicePhoneme[] = [];
  let activeSegment: ActiveSegment | null = null;
  let previousTokenId = CTC_BLANK_ID;

  const commitActiveSegment = () => {
    if (activeSegment === null) {
      return;
    }

    const segment = activeSegment;
    phonemes.push({
      token: VI_PHONE_LABELS[segment.tokenId],
      confidence: segment.confidenceSum / segment.frameCount,
      startTime: (segment.startFrame / frameCount) * durationSeconds,
      endTime: (segment.endFrame / frameCount) * durationSeconds,
    });
    activeSegment = null;
  };

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const prediction = predictFrame(logits, frameIndex * vocabSize, vocabSize);

    if (prediction.tokenId === CTC_BLANK_ID) {
      commitActiveSegment();
      previousTokenId = CTC_BLANK_ID;
      continue;
    }

    if (activeSegment !== null && prediction.tokenId === previousTokenId) {
      activeSegment.endFrame = frameIndex + 1;
      activeSegment.confidenceSum += prediction.confidence;
      activeSegment.frameCount += 1;
    } else {
      commitActiveSegment();
      activeSegment = {
        tokenId: prediction.tokenId,
        startFrame: frameIndex,
        endFrame: frameIndex + 1,
        confidenceSum: prediction.confidence,
        frameCount: 1,
      };
    }

    previousTokenId = prediction.tokenId;
  }

  commitActiveSegment();

  const confidence = phonemes.length === 0
    ? 0
    : phonemes.reduce((sum, phoneme) => sum + (phoneme.confidence ?? 0), 0) / phonemes.length;

  return { phonemes, confidence };
}
