import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  FileAudio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import type {
  LocalVoiceModelStatus,
  LocalVoiceResult,
} from '../../services/ml/voiceModel.types';
import { AudioPlayer } from './AudioPlayer';
import '../../styles/local-voice-check.css';

export interface LocalVoiceCheckProps {
  status?: LocalVoiceModelStatus;
  progress?: number;
  result?: LocalVoiceResult | null;
  error?: string | null;
  isCached?: boolean;
  maxFileSizeMB?: number;
  accept?: string;
  onFileSelected?: (file: File | null) => void;
  onAnalyze?: (file: File) => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
  onReset?: () => void;
}

const DEFAULT_ACCEPT = 'audio/wav,audio/mpeg,audio/mp4,audio/webm,audio/ogg,.wav,.mp3,.m4a,.webm,.ogg';
const SUPPORTED_EXTENSIONS = ['wav', 'mp3', 'm4a', 'webm', 'ogg'];

const BUSY_STATUSES = new Set<LocalVoiceModelStatus>([
  'checking',
  'downloading',
  'loading',
  'running',
]);

function clampProgress(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  const normalized = (value ?? 0) > 1 ? (value ?? 0) / 100 : value ?? 0;
  return Math.min(1, Math.max(0, normalized));
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatConfidence(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return null;
  const normalized = value > 1 ? value / 100 : value;
  return `${Math.round(Math.min(1, Math.max(0, normalized)) * 100)}%`;
}

function getConfidenceClass(value: number | undefined) {
  if (value === undefined) return '';
  const normalized = value > 1 ? value / 100 : value;
  if (normalized >= 0.8) return ' is-high';
  if (normalized >= 0.6) return ' is-medium';
  return ' is-low';
}

function getAnalysisStatusCopy(status: LocalVoiceModelStatus, isCached: boolean) {
  switch (status) {
    case 'checking':
      return { title: 'Đang chuẩn bị', detail: 'GOODVIET đang kiểm tra dữ liệu cần thiết cho lần phân tích này.' };
    case 'downloading':
      return { title: 'Đang chuẩn bị bộ phân tích', detail: 'Giữ trang này mở trong ít phút. Những lần sau sẽ nhanh hơn.' };
    case 'loading':
      return { title: 'Sắp sẵn sàng', detail: 'GOODVIET đang chuẩn bị kiểm tra bản ghi trên thiết bị của bạn.' };
    case 'ready':
      return { title: isCached ? 'Sẵn sàng kiểm tra' : 'Đã sẵn sàng', detail: 'Bạn có thể bắt đầu phân tích bản ghi.' };
    case 'running':
      return { title: 'Đang phân tích bản ghi', detail: 'Thời gian xử lý phụ thuộc vào độ dài tệp.' };
    case 'complete':
      return { title: 'Đã hoàn tất', detail: 'Kết quả của bạn đã sẵn sàng.' };
    case 'missing-artifacts':
      return { title: 'Chưa thể chuẩn bị tính năng', detail: 'Một số dữ liệu cần thiết chưa sẵn sàng. Vui lòng thử lại sau.' };
    case 'error':
      return { title: 'Chưa thể bắt đầu', detail: 'Hãy kiểm tra kết nối, dung lượng lưu trữ rồi thử lại.' };
    default:
      return { title: 'Sẵn sàng khi bạn bắt đầu', detail: 'Lần chuẩn bị đầu tiên có thể mất vài phút; những lần sau sẽ nhanh hơn.' };
  }
}

export function LocalVoiceCheck({
  status = 'idle',
  progress = 0,
  result = null,
  error = null,
  isCached = false,
  maxFileSizeMB = 50,
  accept = DEFAULT_ACCEPT,
  onFileSelected,
  onAnalyze,
  onRetry,
  onReset,
}: LocalVoiceCheckProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const normalizedProgress = clampProgress(progress);
  const progressPercent = Math.round(normalizedProgress * 100);
  const isBusy = BUSY_STATUSES.has(status);
  const canAnalyze = Boolean(selectedFile && onAnalyze && !isBusy && status !== 'missing-artifacts' && status !== 'error');
  const statusCopy = getAnalysisStatusCopy(status, isCached);
  const resultConfidence = formatConfidence(result?.confidence);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelected?.(null);
    onReset?.();
  };

  const selectFile = (file: File | undefined) => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isAudio = file.type.startsWith('audio/') || SUPPORTED_EXTENSIONS.includes(extension);
    if (!isAudio) {
      setValidationError('Định dạng chưa được hỗ trợ. Hãy chọn WAV, MP3, M4A, WebM hoặc OGG.');
      return;
    }

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setValidationError(`Tệp vượt quá ${maxFileSizeMB} MB. Hãy chọn một bản ghi ngắn hơn.`);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setValidationError(null);
    onFileSelected?.(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !onAnalyze) return;
    await onAnalyze(selectedFile);
  };

  return (
    <section className="local-voice-check" aria-labelledby={`${inputId}-title`}>
      <div className="local-voice-check__heading">
        <div className="local-voice-check__eyebrow">
          <Sparkles size={15} aria-hidden="true" />
          Kiểm tra ngay trên thiết bị
        </div>
        <h2 id={`${inputId}-title`}>Tải bản ghi và kiểm tra phát âm</h2>
        <p>
          Bản ghi được xử lý an toàn trên thiết bị và chỉ dùng để tạo kết quả cho lần kiểm tra này.
        </p>
      </div>

      <div className="local-voice-check__privacy" role="note">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <strong>Riêng tư theo mặc định</strong>
          <span>Không tải bản ghi lên máy chủ, không cần chờ xử lý từ xa.</span>
        </div>
      </div>

      <div className="local-voice-check__grid">
        <div className="local-voice-check__upload-column">
          {!selectedFile ? (
            <div
              className={`local-voice-dropzone${isDragging ? ' is-dragging' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleDropzoneKeyDown}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              aria-describedby={`${inputId}-formats`}
            >
              <span className="local-voice-dropzone__icon"><UploadCloud size={30} aria-hidden="true" /></span>
              <strong>Kéo thả bản ghi vào đây</strong>
              <span>hoặc nhấn để chọn tệp từ máy</span>
              <small id={`${inputId}-formats`}>WAV, MP3, M4A, WebM hoặc OGG · tối đa {maxFileSizeMB} MB</small>
            </div>
          ) : (
            <div className="local-voice-file">
              <div className="local-voice-file__meta">
                <span className="local-voice-file__icon"><FileAudio size={24} aria-hidden="true" /></span>
                <div>
                  <strong title={selectedFile.name}>{selectedFile.name}</strong>
                  <span>{formatBytes(selectedFile.size)}</span>
                </div>
                <button type="button" onClick={clearFile} disabled={isBusy} aria-label="Bỏ tệp đã chọn">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {previewUrl && <AudioPlayer src={previewUrl} compact />}
            </div>
          )}

          <input
            ref={fileInputRef}
            id={inputId}
            className="local-voice-check__file-input"
            type="file"
            accept={accept}
            onChange={handleFileInput}
          />

          {validationError && (
            <div className="local-voice-check__error" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          <button
            type="button"
            className="local-voice-check__analyze"
            disabled={!canAnalyze}
            onClick={handleAnalyze}
          >
            {status === 'running' ? (
              <><span className="local-voice-check__spinner" aria-hidden="true" /> Đang phân tích...</>
            ) : status === 'downloading' || status === 'loading' || status === 'checking' ? (
              <><Download size={19} aria-hidden="true" /> Đang chuẩn bị...</>
            ) : (
              <><Cpu size={19} aria-hidden="true" /> {status === 'ready' || status === 'complete' ? 'Phân tích bản ghi' : 'Bắt đầu phân tích'}</>
            )}
          </button>
        </div>

        <div className={`local-model-status is-${status}`} aria-live="polite">
          <div className="local-model-status__top">
            <span className="local-model-status__icon">
              {status === 'complete' || status === 'ready' ? <CheckCircle2 size={22} aria-hidden="true" /> :
                status === 'error' || status === 'missing-artifacts' ? <AlertTriangle size={22} aria-hidden="true" /> :
                  status === 'downloading' ? <Download size={22} aria-hidden="true" /> : <Cpu size={22} aria-hidden="true" />}
            </span>
            <div>
              <strong>{statusCopy.title}</strong>
              <span>{statusCopy.detail}</span>
            </div>
          </div>

          {(status === 'checking' || status === 'downloading' || status === 'loading' || status === 'running') && (
            <div className="local-model-status__progress">
              <div className="local-model-status__progress-label">
                <span>{status === 'running' ? 'Tiến độ xử lý' : 'Tiến độ chuẩn bị'}</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="local-model-status__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          {(error || status === 'missing-artifacts') && (
            <div className="local-model-status__error" role="alert">
              Chưa thể phân tích bản ghi. Vui lòng kiểm tra kết nối, dung lượng thiết bị rồi thử lại.
            </div>
          )}

          {(status === 'error' || status === 'missing-artifacts') && onRetry && (
            <button type="button" className="local-model-status__retry" onClick={onRetry}>
              <RotateCcw size={16} aria-hidden="true" /> Thử tải lại
            </button>
          )}

          <div className="local-model-status__facts">
            <span><ShieldCheck size={15} aria-hidden="true" /> Bản ghi được bảo vệ</span>
            <span><Download size={15} aria-hidden="true" /> {isCached ? 'Sẵn sàng dùng lại' : 'Chuẩn bị một lần'}</span>
          </div>
        </div>
      </div>

      {result && (
        <div className="local-voice-result" aria-live="polite">
          <div className="local-voice-result__header">
            <div>
              <span className="local-voice-result__kicker"><CheckCircle2 size={16} aria-hidden="true" /> Đã phân tích xong</span>
              <h3>Kết quả phân tích bản ghi</h3>
            </div>
            {resultConfidence && (
              <div className="local-voice-result__score">
                <span>Độ rõ tín hiệu</span>
                <strong>{resultConfidence}</strong>
              </div>
            )}
          </div>

          {result.phonemes.length > 0 ? (
            <div className="local-voice-result__phonemes" aria-label="Các âm nhận diện rõ">
              {result.phonemes.map((phoneme, index) => (
                <span
                  key={`${phoneme.token}-${phoneme.startTime ?? index}-${index}`}
                  className={`local-voice-result__phoneme${getConfidenceClass(phoneme.confidence)}`}
                  title={phoneme.confidence === undefined ? phoneme.token : `${phoneme.token}: rõ ${formatConfidence(phoneme.confidence)}`}
                >
                  {phoneme.token}
                  {phoneme.confidence !== undefined && <small>{formatConfidence(phoneme.confidence)}</small>}
                </span>
              ))}
            </div>
          ) : (
            <p className="local-voice-result__empty">Chưa nhận diện được nội dung rõ ràng trong bản ghi này.</p>
          )}

          <p className="local-voice-result__disclaimer">
            Kết quả này mang tính tham khảo và giúp bạn chọn nội dung luyện tập phù hợp.
          </p>
        </div>
      )}
    </section>
  );
}
