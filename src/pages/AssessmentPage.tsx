import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { phaseISentences, phaseIISentences, phaseIIIPrompts, mockAssessmentResult } from '../data/mockAssessment';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Play, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { config } from '../config/env';

function IntroPhase({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      textAlign: 'center',
      background: 'var(--md-sys-color-surface-container-lowest)',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      padding: 'var(--md-sys-space-3xl)',
      boxShadow: 'var(--md-sys-elevation-2)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-space-xl)' }}>🎙️</div>
      <h2 style={{
        fontSize: 'var(--md-sys-typescale-headline-small-size)',
        fontWeight: 700,
        marginBottom: 'var(--md-sys-space-md)',
        color: 'var(--md-sys-color-on-surface)',
      }}>
        <span style={{ color: 'var(--md-sys-color-primary)' }}>GOODVIET Check</span> — Bài test sàng lọc giọng nói
      </h2>
      <p style={{
        color: 'var(--md-sys-color-on-surface-variant)',
        marginBottom: 'var(--md-sys-space-2xl)',
        lineHeight: 1.8,
        fontSize: 'var(--md-sys-typescale-body-large-size)',
      }}>
        Bài test gồm <strong>3 giai đoạn</strong> giúp xác định các vấn đề phát âm của bạn:
      </p>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--md-sys-space-md)',
        textAlign: 'left',
        maxWidth: 500,
        margin: '0 auto var(--md-sys-space-2xl)',
      }}>
        {[
          { num: 'I', text: 'Đọc 12 câu văn ngắn kiểm tra các lỗi phát âm cơ bản' },
          { num: 'II', text: 'Đọc lại các câu bị sai + câu bổ sung để xác nhận lỗi' },
          { num: 'III', text: 'Kể chuyện tự do để đánh giá toàn diện giọng nói' },
        ].map(item => (
          <div key={item.num} style={{
            padding: 'var(--md-sys-space-md)',
            display: 'flex',
            gap: 'var(--md-sys-space-md)',
            alignItems: 'center',
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: 'var(--md-sys-shape-corner-large)',
          }}>
            <span style={{
              fontSize: 'var(--md-sys-typescale-label-large-size)',
              fontWeight: 700,
              padding: '6px 14px',
              background: 'var(--md-sys-color-secondary-container)',
              color: 'var(--md-sys-color-on-secondary-container)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
            }}>
              {item.num}
            </span>
            <span style={{
              fontSize: 'var(--md-sys-typescale-body-medium-size)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
      <p style={{
        fontSize: 'var(--md-sys-typescale-body-small-size)',
        color: 'var(--md-sys-color-on-surface-variant)',
        marginBottom: 'var(--md-sys-space-xl)',
      }}>
        ⚠️ Mỗi tài khoản chỉ được làm bài test này <strong>1 lần duy nhất</strong>. Hãy chuẩn bị ở nơi yên tĩnh.
      </p>
      <button
        onClick={onStart}
        style={{
          width: '100%',
          maxWidth: 300,
          padding: '14px 24px',
          background: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none',
          borderRadius: 'var(--md-sys-shape-corner-full)',
          fontSize: 'var(--md-sys-typescale-label-large-size)',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--md-sys-space-sm)',
          boxShadow: 'var(--md-sys-elevation-1)',
          margin: '0 auto',
          transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Play size={18} /> Bắt đầu bài test
      </button>
    </div>
  );
}

function SentenceRecording({ sentences, title, subtitle, onComplete }: {
  sentences: { id: string; text: string }[];
  title: string;
  subtitle: string;
  onComplete: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordings, setRecordings] = useState<Map<number, { blob: Blob; duration: number; url: string }>>(new Map());
  const addRecording = useAssessmentStore(s => s.addRecording);
  const user = useAuthStore(s => s.user);

  const handleRecordComplete = useCallback(async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setRecordings(prev => {
      const next = new Map(prev);
      // Revoke old URL if re-recording
      const old = next.get(currentIdx);
      if (old?.url) URL.revokeObjectURL(old.url);
      next.set(currentIdx, { blob, duration, url });
      return next;
    });

    addRecording({
      sentenceId: sentences[currentIdx].id,
      blob,
      duration,
      timestamp: new Date().toISOString(),
    });

    // Save to IndexedDB
    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        sentenceId: sentences[currentIdx].id,
        phase: title.includes('I') ? 'phase_1' : 'phase_2',
        duration,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB:', err);
    }

    toast.success('Ghi âm thành công!', `Câu ${currentIdx + 1} đã được ghi.`);
  }, [currentIdx, sentences, addRecording, user?.userId, title]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDone = recordings.size === sentences.length;
  const isRecorded = recordings.has(currentIdx);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="text-center mb-lg">
        <h2 style={{ fontSize: 'var(--gv-font-size-2xl)', fontWeight: 700 }}>{title}</h2>
        <p className="text-secondary mt-md">{subtitle}</p>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <span className="badge badge-primary">Câu {currentIdx + 1} / {sentences.length}</span>
        <span className="text-sm text-muted">Đã ghi: {recordings.size} / {sentences.length}</span>
      </div>

      <div className="progress-bar mb-lg">
        <div className="progress-bar-fill" style={{ width: `${(recordings.size / sentences.length) * 100}%` }} />
      </div>

      <div className="card-positivus" style={{ textAlign: 'center', marginBottom: 'var(--gv-space-xl)' }}>
        <p style={{ fontSize: 'var(--gv-font-size-xl)', fontWeight: 600, lineHeight: 1.8, padding: 'var(--gv-space-md)' }}>
          "{sentences[currentIdx].text}"
        </p>
        {isRecorded && (
          <div style={{ marginTop: 'var(--gv-space-md)' }}>
            <span className="badge badge-success"><CheckCircle size={12} /> Đã ghi âm</span>
            <div style={{ marginTop: 'var(--gv-space-sm)' }}>
              <AudioPlayer
                src={recordings.get(currentIdx)?.url || null}
                compact
                label={`Câu ${currentIdx + 1}`}
              />
            </div>
          </div>
        )}
      </div>

      <AudioRecorder
        onRecordingComplete={handleRecordComplete}
        maxDuration={config.audio.maxDurationSeconds}
        showPlayback={false}
      />

      <div className="flex justify-between mt-lg">
        <button className="btn btn-secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
          ← Câu trước
        </button>
        {currentIdx < sentences.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentIdx(i => i + 1)}>
            Câu tiếp →
          </button>
        ) : (
          <button className="btn btn-success" disabled={!allDone} onClick={onComplete}>
            <ChevronRight size={16} /> Hoàn thành giai đoạn
          </button>
        )}
      </div>

      {!allDone && currentIdx === sentences.length - 1 && (
        <p className="text-xs text-muted text-center mt-md" style={{ color: 'var(--gv-warning)' }}>
          <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> Bạn cần ghi âm tất cả {sentences.length} câu trước khi hoàn thành.
        </p>
      )}
    </div>
  );
}

function StorytellingPhase({ onComplete }: { onComplete: () => void }) {
  const [recorded, setRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const user = useAuthStore(s => s.user);
  const addRecording = useAssessmentStore(s => s.addRecording);

  const handleRecordComplete = useCallback(async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setRecorded(true);

    addRecording({
      sentenceId: 'phase_3_storytelling',
      blob,
      duration,
      timestamp: new Date().toISOString(),
    });

    // Save to IndexedDB
    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        sentenceId: 'phase_3_storytelling',
        phase: 'phase_3',
        duration,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB:', err);
    }

    toast.success('Ghi âm hoàn tất!', 'Bài kể chuyện của bạn đã được lưu.');
  }, [addRecording, user?.userId]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="text-center mb-lg">
        <h2 style={{ fontSize: 'var(--gv-font-size-2xl)', fontWeight: 700 }}>
          Giai đoạn III — Kể chuyện tự do
        </h2>
        <p className="text-secondary mt-md">
          Hãy kể về câu chuyện hàng ngày của bạn. Chúng tôi sẽ đánh giá phát âm, hơi thở, âm điệu và sự tự tin.
        </p>
      </div>

      <div className="card-positivus text-center mb-lg" style={{ padding: 'var(--gv-space-xl)' }}>
        <p style={{ fontSize: 'var(--gv-font-size-lg)', fontStyle: 'italic', lineHeight: 1.8 }}>
          "{phaseIIIPrompts[0]}"
        </p>
      </div>

      <AudioRecorder
        onRecordingComplete={handleRecordComplete}
        maxDuration={config.audio.maxDurationSeconds}
        minDuration={config.audio.minStorytellingDuration}
        showPlayback
      />

      <div className="card mt-lg" style={{ padding: 'var(--gv-space-md)' }}>
        <p className="text-sm font-semibold mb-md">Câu hỏi gợi ý thêm:</p>
        {phaseIIIPrompts.slice(1).map((q, i) => (
          <p key={i} className="text-sm text-secondary" style={{ padding: '4px 0' }}>• {q}</p>
        ))}
      </div>

      {recorded && audioUrl && (
        <div style={{ marginTop: 'var(--gv-space-lg)' }}>
          <AudioPlayer src={audioUrl} label="Bài kể chuyện của bạn" />
        </div>
      )}

      <div className="text-center mt-lg">
        <button
          className="btn btn-success btn-lg"
          disabled={!recorded}
          onClick={onComplete}
        >
          <CheckCircle size={18} /> Hoàn thành bài test
        </button>
        {!recorded && (
          <p className="text-xs text-muted mt-md">
            Bạn cần ghi âm ít nhất 2 phút trước khi hoàn thành.
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessingPhase({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Đang phân tích giọng nói...');

  useEffect(() => {
    const texts = [
      'Đang phân tích giọng nói...',
      'AI đang xử lý phát âm...',
      'Phát hiện lỗi phát âm L/N, TR/CH, S/X...',
      'Chuyên gia đang xác nhận kết quả...',
      'Sắp hoàn thành...',
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(step * 20, 100));
      setStatusText(texts[Math.min(step, texts.length - 1)]);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(onDone, 500);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="processing-container animate-scale-in">
      <div className="processing-spinner" />
      <h2 style={{ fontSize: 'var(--gv-font-size-2xl)', fontWeight: 700 }}>Đang xử lý kết quả</h2>
      <p className="text-secondary">{statusText}</p>
      <div className="progress-bar" style={{ width: 300, marginTop: 'var(--gv-space-md)' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
      </div>
      <p className="text-xs text-muted" style={{ marginTop: 'var(--gv-space-md)' }}>
        Vui lòng đợi khoảng 2-3 phút...
      </p>
      <p className="text-xs text-muted">
        Thời gian ước tính: ~{Math.max(0, Math.ceil((100 - progress) / 20 * 1.5))} giây
      </p>
    </div>
  );
}

function ResultsPhase() {
  const result = mockAssessmentResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--gv-success)';
    if (score >= 60) return 'var(--gv-warning)';
    return 'var(--gv-error)';
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'mild': return <span className="badge badge-info">Nhẹ</span>;
      case 'moderate': return <span className="badge badge-warning">Trung bình</span>;
      case 'severe': return <span className="badge badge-error">Nặng</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="text-center mb-lg">
        <div style={{ fontSize: '3rem', marginBottom: 'var(--gv-space-md)' }}>📊</div>
        <h2 style={{ fontSize: 'var(--gv-font-size-2xl)', fontWeight: 700 }}>Kết quả <span className="heading-highlight">GOODVIET Check</span></h2>
        <p className="text-secondary mt-md">Kết quả kết hợp phân tích AI và đánh giá của chuyên gia</p>
      </div>

      {/* Overall Score */}
      <div className="card-positivus text-center" style={{ marginBottom: 'var(--gv-space-xl)', padding: 'var(--gv-space-2xl)' }}>
        <div style={{ fontSize: '4rem', fontWeight: 700, color: getScoreColor(result.overallScore) }}>
          {result.overallScore}
        </div>
        <div className="text-secondary">Điểm tổng thể / 100</div>
      </div>

      {/* Score Breakdown */}
      <div className="stats-grid" style={{ marginBottom: 'var(--gv-space-xl)' }}>
        {[
          { label: 'Phát âm rõ ràng', value: result.clarityScore },
          { label: 'Độ trôi chảy', value: result.fluencyScore },
          { label: 'Tốc độ nói', value: `${result.speechRate} từ/phút` },
          { label: 'Mức tự tin', value: result.confidenceLevel === 'high' ? 'Cao' : result.confidenceLevel === 'medium' ? 'Trung bình' : 'Thấp' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: 'var(--gv-font-size-2xl)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pronunciation Issues */}
      <div className="card-positivus" style={{ marginBottom: 'var(--gv-space-xl)' }}>
        <div className="flex items-center gap-sm mb-lg">
          <AlertTriangle size={20} style={{ color: 'var(--gv-warning)' }} />
          <span className="font-semibold">Các vấn đề phát âm phát hiện</span>
        </div>
        <div className="flex flex-col gap-md">
          {result.pronunciationIssues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              padding: 'var(--gv-space-md)',
              background: 'var(--gv-light)',
              borderRadius: 'var(--gv-radius-md)',
              border: '1px solid var(--gv-border)',
            }}>
              <div>
                <div className="font-semibold">Phụ âm {issue.phoneme.toUpperCase()}</div>
                <div className="text-sm text-muted">{issue.description}</div>
              </div>
              {getSeverityBadge(issue.severity)}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Pathway */}
      <div className="card-dark">
        <h3 className="font-semibold mb-md">🎯 Lộ trình được đề xuất</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--gv-space-lg)', lineHeight: 1.7 }}>
          Dựa trên kết quả phân tích, chúng tôi đề xuất lộ trình <strong style={{ color: 'var(--gv-lime)' }}>GoodSound - Cải thiện phát âm L/N</strong> trong 35 ngày, tập trung vào:
        </p>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--gv-space-lg)' }}>
          <span className="badge badge-primary">Phát âm L/N</span>
          <span className="badge badge-primary">Phân biệt TR/CH</span>
          <span className="badge badge-primary">Phân biệt S/X</span>
        </div>
        <button className="btn btn-lime btn-lg" onClick={() => { window.location.href = '/pathway'; }}>
          Bắt đầu lộ trình luyện tập →
        </button>
      </div>
    </div>
  );
}

export function AssessmentPage() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const { phase, setPhase, completeAssessment } = useAssessmentStore();

  const steps = [
    { num: 1, label: 'Giai đoạn I', key: 'phase_1' },
    { num: 2, label: 'Giai đoạn II', key: 'phase_2' },
    { num: 3, label: 'Giai đoạn III', key: 'phase_3' },
    { num: 4, label: 'Kết quả', key: 'results' },
  ];

  const phaseOrder = ['phase_1', 'phase_2', 'phase_3', 'processing', 'results'];
  const currentPhaseIdx = phaseOrder.indexOf(phase);

  if (user?.assessmentCompleted && phase !== 'results') {
    return (
      <div className="animate-fade-in-up" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card-positivus text-center" style={{ padding: 'var(--gv-space-2xl)' }}>
          <CheckCircle size={48} style={{ color: 'var(--gv-success)', margin: '0 auto var(--gv-space-lg)' }} />
          <h2 style={{ marginBottom: 'var(--gv-space-md)' }}>Bạn đã hoàn thành GOODVIET Check</h2>
          <p className="text-secondary">Mỗi tài khoản chỉ được làm bài test 1 lần duy nhất.</p>
          <button className="btn btn-primary mt-lg" onClick={() => setPhase('results')}>
            Xem lại kết quả
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header text-center">
        <h1 className="page-title"><span className="heading-highlight">GOODVIET Check</span></h1>
        <p className="page-subtitle">Bài test sàng lọc giọng nói</p>
      </div>

      {phase !== 'not_started' && phase !== 'intro' && (
        <div className="assessment-steps">
          {steps.map((step, i) => (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gv-space-md)' }}>
              <div className={`assessment-step ${
                step.key === phase ? 'active' : currentPhaseIdx > i ? 'completed' : ''
              }`}>
                <div className="assessment-step-num">
                  {currentPhaseIdx > i ? '✓' : step.num}
                </div>
                <span className="assessment-step-label">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`assessment-step-line ${currentPhaseIdx > i ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {(phase === 'not_started' || phase === 'intro') && (
        <IntroPhase onStart={() => setPhase('phase_1')} />
      )}

      {phase === 'phase_1' && (
        <SentenceRecording
          sentences={phaseISentences}
          title="Giai đoạn I — Kiểm tra phát âm cơ bản"
          subtitle="Đọc rõ ràng từng câu văn bên dưới và ghi âm"
          onComplete={() => setPhase('phase_2')}
        />
      )}

      {phase === 'phase_2' && (
        <SentenceRecording
          sentences={phaseIISentences}
          title="Giai đoạn II — Xác nhận lỗi phát âm"
          subtitle="Đọc lại các câu có lỗi phát hiện ở Giai đoạn I để xác nhận"
          onComplete={() => setPhase('phase_3')}
        />
      )}

      {phase === 'phase_3' && (
        <StorytellingPhase onComplete={() => setPhase('processing')} />
      )}

      {phase === 'processing' && (
        <ProcessingPhase onDone={() => {
          completeAssessment();
          updateUser({ assessmentCompleted: true, currentPathwayId: 'pathway-001' });
          toast.success('Hoàn thành!', 'Kết quả GOODVIET Check đã sẵn sàng.');
        }} />
      )}

      {phase === 'results' && <ResultsPhase />}
    </div>
  );
}
