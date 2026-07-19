export const VOICE_MODEL_SAMPLE_RATE = 16_000;
export const MAX_LOCAL_VOICE_DURATION_SECONDS = 30;

export interface PreparedVoiceAudio {
  samples: Float32Array;
  durationSeconds: number;
}

export class VoiceAudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoiceAudioError';
  }
}

function downmixAudio(buffer: AudioBuffer): Float32Array {
  const mono = new Float32Array(buffer.length);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const source = buffer.getChannelData(channel);
    for (let index = 0; index < source.length; index += 1) {
      mono[index] += source[index] / buffer.numberOfChannels;
    }
  }

  return mono;
}

function resampleLinear(input: Float32Array, sourceRate: number, targetRate: number): Float32Array {
  if (sourceRate === targetRate) return input.slice();

  const outputLength = Math.max(1, Math.round(input.length * targetRate / sourceRate));
  const output = new Float32Array(outputLength);
  const ratio = sourceRate / targetRate;

  for (let index = 0; index < outputLength; index += 1) {
    const sourcePosition = index * ratio;
    const leftIndex = Math.floor(sourcePosition);
    const rightIndex = Math.min(leftIndex + 1, input.length - 1);
    const mix = sourcePosition - leftIndex;
    output[index] = input[leftIndex] * (1 - mix) + input[rightIndex] * mix;
  }

  return output;
}

function getRms(samples: Float32Array): number {
  let sumSquares = 0;
  for (let index = 0; index < samples.length; index += 1) {
    sumSquares += samples[index] * samples[index];
  }
  return Math.sqrt(sumSquares / Math.max(1, samples.length));
}

export async function prepareVoiceAudio(
  file: File,
  maxDurationSeconds = MAX_LOCAL_VOICE_DURATION_SECONDS,
): Promise<PreparedVoiceAudio> {
  if (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|mp4|webm|ogg)$/i.test(file.name)) {
    throw new VoiceAudioError('Tệp đã chọn không phải định dạng âm thanh được hỗ trợ.');
  }

  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) {
    throw new VoiceAudioError('Trình duyệt này không hỗ trợ giải mã âm thanh cục bộ.');
  }

  const context = new AudioContextClass();
  try {
    const encoded = await file.arrayBuffer();
    const decoded = await context.decodeAudioData(encoded.slice(0));

    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0) {
      throw new VoiceAudioError('Không đọc được thời lượng của bản ghi.');
    }
    if (decoded.duration > maxDurationSeconds) {
      throw new VoiceAudioError(`Bản ghi dài hơn ${maxDurationSeconds} giây. Hãy cắt ngắn tệp để phân tích ổn định trên thiết bị.`);
    }

    const mono = downmixAudio(decoded);
    const samples = resampleLinear(mono, decoded.sampleRate, VOICE_MODEL_SAMPLE_RATE);

    if (samples.length < VOICE_MODEL_SAMPLE_RATE / 4) {
      throw new VoiceAudioError('Bản ghi quá ngắn. Hãy chọn tệp dài ít nhất 0,25 giây.');
    }
    if (getRms(samples) < 0.0005) {
      throw new VoiceAudioError('Bản ghi gần như không có tiếng. Hãy kiểm tra âm lượng rồi thử lại.');
    }

    return {
      samples,
      durationSeconds: samples.length / VOICE_MODEL_SAMPLE_RATE,
    };
  } catch (error) {
    if (error instanceof VoiceAudioError) throw error;
    throw new VoiceAudioError('Không giải mã được tệp này. Hãy thử WAV, MP3, M4A, WebM hoặc OGG khác.');
  } finally {
    await context.close().catch(() => undefined);
  }
}
