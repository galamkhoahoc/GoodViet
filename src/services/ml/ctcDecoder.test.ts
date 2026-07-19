import { describe, expect, it } from 'vitest';
import { VI_PHONE_LABELS } from '../../data/voicePhonemes';
import { decodeCtcLogits } from './ctcDecoder';

const VOCAB_SIZE = VI_PHONE_LABELS.length;

interface FrameSpec {
  tokenId: number;
  confidence: number;
}

function makeLogits(frames: FrameSpec[]) {
  const logits = new Float32Array(frames.length * VOCAB_SIZE);
  logits.fill(-1_000);

  frames.forEach(({ tokenId, confidence }, frameIndex) => {
    const offset = frameIndex * VOCAB_SIZE;
    const competitorId = tokenId === 1 ? 2 : 1;
    const logitGap = Math.log(confidence / (1 - confidence));

    // Large offsets exercise the max-subtraction used by stable softmax.
    logits[offset + competitorId] = 1_000;
    logits[offset + tokenId] = 1_000 + logitGap;
  });

  return logits;
}

describe('decodeCtcLogits', () => {
  it('collapses contiguous repeats, but emits the same token again after a blank', () => {
    const frames = [
      { tokenId: 1, confidence: 0.8 },
      { tokenId: 1, confidence: 0.6 },
      { tokenId: 0, confidence: 0.99 },
      { tokenId: 1, confidence: 0.9 },
      { tokenId: 2, confidence: 0.7 },
      { tokenId: 2, confidence: 0.6 },
    ];

    const result = decodeCtcLogits(makeLogits(frames), frames.length, VOCAB_SIZE, 6);

    expect(result.phonemes).toHaveLength(3);
    expect(result.phonemes.map(({ token }) => token)).toEqual(['a-0', 'a-0', 'a-1']);
    expect(result.phonemes[0]).toMatchObject({ startTime: 0, endTime: 2 });
    expect(result.phonemes[1]).toMatchObject({ startTime: 3, endTime: 4 });
    expect(result.phonemes[2]).toMatchObject({ startTime: 4, endTime: 6 });
    expect(result.phonemes[0].confidence).toBeCloseTo(0.7, 4);
    expect(result.phonemes[1].confidence).toBeCloseTo(0.9, 4);
    expect(result.phonemes[2].confidence).toBeCloseTo(0.65, 4);
    expect(result.confidence).toBeCloseTo(0.75, 4);
  });

  it('computes a stable softmax confidence for very large logits', () => {
    const logits = makeLogits([{ tokenId: 3, confidence: 0.8 }]);
    const result = decodeCtcLogits(logits, 1, VOCAB_SIZE, 0.5);

    expect(result.phonemes).toHaveLength(1);
    expect(result.phonemes[0].confidence).toBeCloseTo(0.8, 4);
    expect(result.confidence).toBeCloseTo(0.8, 4);
  });

  it('returns an empty, zero-confidence result for blank-only audio', () => {
    const logits = makeLogits([
      { tokenId: 0, confidence: 0.9 },
      { tokenId: 0, confidence: 0.8 },
    ]);

    expect(decodeCtcLogits(logits, 2, VOCAB_SIZE, 1)).toEqual({
      phonemes: [],
      confidence: 0,
    });
  });

  it('rejects inconsistent or unsupported tensor dimensions', () => {
    expect(() => decodeCtcLogits(new Float32Array(VOCAB_SIZE), 0, VOCAB_SIZE, 1))
      .toThrow(/frameCount/);
    expect(() => decodeCtcLogits(new Float32Array(VOCAB_SIZE), 1, VOCAB_SIZE - 1, 1))
      .toThrow(/vocabSize/);
    expect(() => decodeCtcLogits(new Float32Array(VOCAB_SIZE - 1), 1, VOCAB_SIZE, 1))
      .toThrow(/logits length/);
  });
});
