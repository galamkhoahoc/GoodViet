import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Play, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { config } from '../config/env';

function IntroPhase({ onStart, isLoading }: { onStart: () => void, isLoading: boolean }) {
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
        Bài test gồm <strong>3 giai đoạn</strong> giúp phân tích chuyên sâu bởi AI và Chuyên gia:
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
        disabled={isLoading}
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
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--md-sys-space-sm)',
          boxShadow: 'var(--md-sys-elevation-1)',
          margin: '0 auto',
          transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
        }}
      >
        <Play size={18} /> {isLoading ? 'Đang khởi tạo...' : 'Bắt đầu bài test'}
      </button>
    </div>
  );
}

function SentenceRecording({ sentences, title, subtitle, onComplete, isLoading }: {
  sentences: { id: string; text: string }[];
  title: string;
  subtitle: string;
  onComplete: () => void;
  isLoading: boolean;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordings, setRecordings] = useState<Map<number, { blob: Blob; duration: number; url: string }>>(new Map());
  const { addRecording, assessmentId } = useAssessmentStore();
  const user = useAuthStore(s => s.user);

  const handleRecordComplete = useCallback(async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setRecordings(prev => {
      const next = new Map(prev);
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

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        assessmentId: assessmentId || '',
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
  }, [currentIdx, sentences, addRecording, user?.userId, title, assessmentId]);

  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, []);

  if (!sentences || sentences.length === 0) {
    return <div className="text-center p-xl">Đang tải dữ liệu câu hỏi...</div>;
  }

  const allDone = recordings.size === sentences.length;
  const isRecorded = recordings.has(currentIdx);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="text-center mb-lg">
        <h2 style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)', fontWeight: 700 }}>{title}</h2>
        <p className="text-secondary mt-md">{subtitle}</p>
      </div>

      <div className="flex items-center justify-between mb-lg">
        <span className="badge badge-primary">Câu {currentIdx + 1} / {sentences.length}</span>
        <span className="text-sm text-muted">Đã ghi: {recordings.size} / {sentences.length}</span>
      </div>

      <div className="progress-bar mb-lg">
        <div className="progress-bar-fill" style={{ width: `${(recordings.size / sentences.length) * 100}%` }} />
      </div>

      <div className="card-positivus" style={{ textAlign: 'center', marginBottom: 'var(--md-sys-space-xl)' }}>
        <p style={{ fontSize: 'var(--md-sys-typescale-title-medium-size)', fontWeight: 600, lineHeight: 1.8, padding: 'var(--md-sys-space-md)' }}>
          "{sentences[currentIdx].text}"
        </p>
        {isRecorded && (
          <div style={{ marginTop: 'var(--md-sys-space-md)' }}>
            <span className="badge badge-success"><CheckCircle size={12} /> Đã ghi âm</span>
            <div style={{ marginTop: 'var(--md-sys-space-sm)' }}>
              <AudioPlayer src={recordings.get(currentIdx)?.url || null} compact label={`Câu ${currentIdx + 1}`} />
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
          <button className="btn btn-success" disabled={!allDone || isLoading} onClick={onComplete}>
            <ChevronRight size={16} /> {isLoading ? 'Đang gửi...' : 'Hoàn thành giai đoạn'}
          </button>
        )}
      </div>

      {!allDone && currentIdx === sentences.length - 1 && (
        <p className="text-xs text-muted text-center mt-md" style={{ color: 'var(--md-sys-color-tertiary)' }}>
          <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> Bạn cần ghi âm tất cả {sentences.length} câu trước khi hoàn thành.
        </p>
      )}
    </div>
  );
}

function StorytellingPhase({ sentences, onComplete, isLoading }: { sentences: any[], onComplete: () => void, isLoading: boolean }) {
  const [recorded, setRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const user = useAuthStore(s => s.user);
  const { addRecording, assessmentId } = useAssessmentStore();
  
  const mainPrompt = sentences[0]?.text || "Hãy kể về một ngày của bạn";

  const handleRecordComplete = useCallback(async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setRecorded(true);

    addRecording({
      sentenceId: sentences[0]?.id || 'phase_3_storytelling',
      blob,
      duration,
      timestamp: new Date().toISOString(),
    });

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        assessmentId: assessmentId || '',
        sentenceId: sentences[0]?.id || 'phase_3_storytelling',
        phase: 'phase_3',
        duration,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB:', err);
    }

    toast.success('Ghi âm hoàn tất!', 'Bài kể chuyện của bạn đã được lưu.');
  }, [addRecording, user?.userId, assessmentId, sentences]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="text-center mb-lg">
        <h2 style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)', fontWeight: 700 }}>
          Giai đoạn III — Kể chuyện tự do
        </h2>
        <p className="text-secondary mt-md">
          Hãy kể về câu chuyện hàng ngày của bạn. Chúng tôi sẽ đánh giá phát âm, hơi thở, âm điệu và sự tự tin.
        </p>
      </div>

      <div className="card-positivus text-center mb-lg" style={{ padding: 'var(--md-sys-space-xl)' }}>
        <p style={{ fontSize: 'var(--md-sys-typescale-title-small-size)', fontStyle: 'italic', lineHeight: 1.8 }}>
          "{mainPrompt}"
        </p>
      </div>

      <AudioRecorder
        onRecordingComplete={handleRecordComplete}
        maxDuration={config.audio.maxDurationSeconds}
        minDuration={config.audio.minStorytellingDuration}
        showPlayback
      />

      {recorded && audioUrl && (
        <div style={{ marginTop: 'var(--md-sys-space-lg)' }}>
          <AudioPlayer src={audioUrl} label="Bài kể chuyện của bạn" />
        </div>
      )}

      <div className="text-center mt-lg">
        <button
          className="btn btn-success btn-lg"
          disabled={!recorded || isLoading}
          onClick={onComplete}
        >
          <CheckCircle size={18} /> {isLoading ? 'Đang nộp...' : 'Hoàn thành bài test'}
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

function ProcessingPhase() {
  const [statusText, setStatusText] = useState('Đang phân tích giọng nói...');
  const { checkStatus, phase } = useAssessmentStore();

  useEffect(() => {
    const texts = [
      'Đang đồng bộ dữ liệu...',
      'AI đang xử lý âm thanh...',
      'Phân tích ngữ âm...',
      'Đánh giá kết quả...',
      'Sắp hoàn thành...',
    ];
    let step = 0;
    const textInterval = setInterval(() => {
      step = (step + 1) % texts.length;
      setStatusText(texts[step]);
    }, 3000);
    
    // Poll status from API
    const checkInterval = setInterval(() => {
      if (phase === 'processing') {
        checkStatus();
      }
    }, 5000);

    return () => {
      clearInterval(textInterval);
      clearInterval(checkInterval);
    };
  }, [checkStatus, phase]);

  return (
    <div className="processing-container animate-scale-in">
      <div className="processing-spinner" />
      <h2 style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)', fontWeight: 700 }}>Hệ thống đang phân tích</h2>
      <p className="text-secondary mt-md">Vui lòng đợi kết quả sàng lọc khoảng 2-3 phút...</p>
      <div className="progress-bar" style={{ width: 300, marginTop: 'var(--md-sys-space-md)' }}>
        <div className="progress-bar-fill" style={{ width: '100%', animation: 'progress 2s infinite' }} />
      </div>
      <p className="text-xs text-muted" style={{ marginTop: 'var(--md-sys-space-md)' }}>
        Dữ liệu đang được đánh giá bởi cả hệ thống AI và đội ngũ Chuyên gia GOODVIET.
      </p>
    </div>
  );
}

function ResultsPhase() {
  const { result } = useAssessmentStore();
  const updateUser = useAuthStore(s => s.updateUser);
  
  useEffect(() => {
    if (result) {
      updateUser({ assessmentCompleted: true, currentPathwayId: result.recommendedPathwayId });
    }
  }, [result, updateUser]);

  if (!result) return <div className="text-center p-xl">Đang tải kết quả...</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--md-sys-color-primary)';
    if (score >= 60) return 'var(--md-sys-color-tertiary)';
    return 'var(--md-sys-color-error)';
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
        <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-space-md)' }}>📊</div>
        <h2 style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)', fontWeight: 700 }}>Kết quả <span className="heading-highlight">GOODVIET Check</span></h2>
        <p className="text-secondary mt-md">Kết quả phân tích từ AI</p>
      </div>

      <div className="card-positivus text-center" style={{ marginBottom: 'var(--md-sys-space-xl)', padding: 'var(--md-sys-space-2xl)' }}>
        <div style={{ fontSize: '4rem', fontWeight: 700, color: getScoreColor(result.overallScore) }}>
          {result.overallScore}
        </div>
        <div className="text-secondary">Điểm tổng thể / 100</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--md-sys-space-xl)' }}>
        {[
          { label: 'Phát âm rõ ràng', value: result.clarityScore },
          { label: 'Độ trôi chảy', value: result.fluencyScore },
          { label: 'Tốc độ nói', value: `${result.speechRate} từ/phút` },
          { label: 'Mức tự tin', value: result.confidenceLevel === 'high' ? 'Cao' : result.confidenceLevel === 'medium' ? 'Trung bình' : 'Thấp' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card-positivus" style={{ marginBottom: 'var(--md-sys-space-xl)' }}>
        <div className="flex items-center gap-sm mb-lg">
          <AlertTriangle size={20} style={{ color: 'var(--md-sys-color-tertiary)' }} />
          <span className="font-semibold">Các vấn đề phát âm phát hiện</span>
        </div>
        <div className="flex flex-col gap-md">
          {result.pronunciationIssues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              padding: 'var(--md-sys-space-md)',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-medium)',
              border: '1px solid var(--md-sys-color-outline)',
            }}>
              <div>
                <div className="font-semibold">Phụ âm {issue.phoneme.toUpperCase()}</div>
                <div className="text-sm text-muted">{issue.description}</div>
              </div>
              {getSeverityBadge(issue.severity)}
            </div>
          ))}
          {result.pronunciationIssues.length === 0 && (
             <div className="text-center text-muted">Tuyệt vời! Không phát hiện lỗi phát âm nghiêm trọng.</div>
          )}
        </div>
      </div>

      <div className="card-dark">
        <h3 className="font-semibold mb-md">🎯 Lộ trình được đề xuất</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--md-sys-space-lg)', lineHeight: 1.7 }}>
          Dựa trên kết quả phân tích, chúng tôi đã tạo lộ trình cá nhân hóa cho bạn.
        </p>
        <button className="btn btn-lime btn-lg" onClick={() => { window.location.href = '/pathway'; }}>
          Bắt đầu lộ trình luyện tập →
        </button>
      </div>
    </div>
  );
}

export function AssessmentPage() {
  const user = useAuthStore(s => s.user);
  const { phase, sentences, isLoading, startAssessment, completeCurrentPhase, loadResult, result } = useAssessmentStore();

  useEffect(() => {
    // If completed previously and not currently taking it
    if (user?.assessmentCompleted && phase === 'not_started') {
      loadResult();
    }
  }, [user?.assessmentCompleted, phase, loadResult]);

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
        <div className="card-positivus text-center" style={{ padding: 'var(--md-sys-space-2xl)' }}>
          <CheckCircle size={48} style={{ color: 'var(--md-sys-color-primary)', margin: '0 auto var(--md-sys-space-lg)' }} />
          <h2 style={{ marginBottom: 'var(--md-sys-space-md)' }}>Bạn đã hoàn thành GOODVIET Check</h2>
          <p className="text-secondary">Mỗi tài khoản chỉ được làm bài test 1 lần duy nhất.</p>
          <button className="btn btn-primary mt-lg" onClick={() => loadResult()}>
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
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-md)' }}>
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
        <IntroPhase onStart={startAssessment} isLoading={isLoading} />
      )}

      {phase === 'phase_1' && (
        <SentenceRecording
          sentences={sentences}
          title="Giai đoạn I — Kiểm tra phát âm cơ bản"
          subtitle="Đọc rõ ràng từng câu văn bên dưới và ghi âm"
          onComplete={completeCurrentPhase}
          isLoading={isLoading}
        />
      )}

      {phase === 'phase_2' && (
        <SentenceRecording
          sentences={sentences}
          title="Giai đoạn II — Xác nhận lỗi phát âm"
          subtitle="Đọc lại các câu có lỗi phát hiện ở Giai đoạn I để xác nhận"
          onComplete={completeCurrentPhase}
          isLoading={isLoading}
        />
      )}

      {phase === 'phase_3' && (
        <StorytellingPhase 
          sentences={sentences}
          onComplete={completeCurrentPhase}
          isLoading={isLoading}
        />
      )}

      {phase === 'processing' && <ProcessingPhase />}

      {phase === 'results' && <ResultsPhase />}
    </div>
  );
}

