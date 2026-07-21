import { AlertTriangle, AudioLines, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import type { SentenceEvaluationResult, SentenceMetrics } from '../../services/ml/sentenceEvaluation';
import type { SentenceEvaluationStage } from '../../hooks/useLocalSentenceEvaluation';
import '../../styles/sentence-evaluation.css';

interface SentenceEvaluationPanelProps {
  stage: SentenceEvaluationStage;
  progress: number;
  detail: string;
  result: SentenceEvaluationResult | null;
  error: string | null;
  onRetry?: () => void;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="sentence-evaluation__metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

export function SentenceEvaluationPanel({
  stage,
  progress,
  detail,
  result,
  error,
  onRetry,
}: SentenceEvaluationPanelProps) {
  if (stage === 'idle' && !result) {
    return (
      <div className="sentence-evaluation sentence-evaluation--idle">
        <ShieldCheck size={18} />
        <span>Bản thu sẽ được đối chiếu với câu mẫu để tạo điểm và gợi ý cải thiện.</span>
      </div>
    );
  }

  if (stage === 'speech' || stage === 'feedback') {
    const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    return (
      <div className="sentence-evaluation sentence-evaluation--loading" aria-live="polite">
        <div className="sentence-evaluation__status">
          {stage === 'speech' ? <AudioLines size={19} /> : <Sparkles size={19} />}
          <span>
            <strong>{stage === 'speech' ? 'Đang phân tích bản thu' : 'Đang tạo điểm và nhận xét'}</strong>
            <small>{detail}</small>
          </span>
          <b>{percent}%</b>
        </div>
        <div className="sentence-evaluation__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  if (stage === 'error' || error) {
    return (
      <div className="sentence-evaluation sentence-evaluation--error" role="alert">
        <AlertTriangle size={20} />
        <span><strong>Chưa thể chấm câu này</strong><small>{error || detail}</small></span>
        {onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}
      </div>
    );
  }

  if (!result) return null;
  return (
    <div className="sentence-evaluation sentence-evaluation--result" aria-live="polite">
      <div className="sentence-evaluation__score">
        <span><CheckCircle2 size={18} /> Điểm câu đọc</span>
        <strong>{result.score}<small>/100</small></strong>
      </div>
      <div className="sentence-evaluation__metrics">
        <Metric label="Khớp câu mẫu" value={result.transcriptAccuracy} />
        <Metric label="Độ rõ phát âm" value={result.acousticConfidence} />
      </div>
      <div className="sentence-evaluation__transcript">
        <small>Nội dung nhận diện</small>
        <p>{result.transcript || 'Không nhận dạng được nội dung rõ ràng.'}</p>
      </div>
      <div className="sentence-evaluation__feedback">
        <MessageSquareText size={19} />
        <p>{result.feedback}</p>
      </div>
      {(result.strengths.length > 0 || result.improvements.length > 0) && (
        <div className="sentence-evaluation__tips">
          {result.strengths.map(item => <span className="is-good" key={item}>✓ {item}</span>)}
          {result.improvements.map(item => <span key={item}>→ {item}</span>)}
        </div>
      )}
    </div>
  );
}

export type { SentenceMetrics };
