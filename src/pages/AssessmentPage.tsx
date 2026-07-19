import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { config } from '../config/env';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLocalVoiceModel } from '../hooks/useLocalVoiceModel';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';
import { LocalVoiceCheck } from '../components/audio/LocalVoiceCheck';
import type { AssessmentSentence } from '../services/api/assessmentApi';
import '../styles/assessment-page.css';

function IntroPhase({ onStart, isLoading }: { onStart: () => void, isLoading: boolean }) {
  return (
    <div className="max-w-[700px] mx-auto text-center bg-surface-lowest organic-curve p-12 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent">
      <div className="text-5xl mb-6">🎙️</div>
      <h2 className="font-display-lg font-bold tracking-tight mb-4 text-on-surface">
        <span className="text-primary">GOODVIET Check</span> — Bài test sàng lọc giọng nói
      </h2>
      <p className="text-on-surface-variant text-body-lg mb-8 leading-relaxed">
        Bài test gồm <strong>3 giai đoạn</strong> giúp phân tích chuyên sâu bởi AI và Chuyên gia:
      </p>
      
      <div className="flex flex-col gap-4 text-left max-w-[500px] mx-auto mb-8">
        {[
          { num: 'I', text: 'Đọc 12 câu văn ngắn kiểm tra các lỗi phát âm cơ bản' },
          { num: 'II', text: 'Đọc lại các câu bị sai + câu bổ sung để xác nhận lỗi' },
          { num: 'III', text: 'Kể chuyện tự do để đánh giá toàn diện giọng nói' },
        ].map(item => (
          <div key={item.num} className="p-4 flex gap-4 items-center bg-surface-container-low rounded-2xl">
            <span className="font-label-lg px-3 py-1 bg-primary-container text-on-primary-container rounded-full shrink-0">
              {item.num}
            </span>
            <span className="font-body-md text-on-surface">
              {item.text}
            </span>
          </div>
        ))}
      </div>
      
      <p className="font-body-sm text-on-surface-variant mb-8 opacity-80">
        ⚠️ Mỗi tài khoản chỉ được làm bài test này <strong>1 lần duy nhất</strong>. Hãy chuẩn bị ở nơi yên tĩnh.
      </p>
      
      <button
        onClick={onStart}
        disabled={isLoading}
        className={`w-full max-w-[300px] py-4 px-6 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-2 mx-auto shadow-md transition-transform hover:scale-105 hover:bg-primary-fixed-variant ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <Play size={18} /> {isLoading ? 'Đang khởi tạo...' : 'Bắt đầu bài test'}
      </button>
    </div>
  );
}

function SentenceRecording({ sentences, title, subtitle, onComplete, isLoading, phaseKey }: {
  sentences: AssessmentSentence[];
  title: string;
  subtitle: string;
  onComplete: () => void;
  isLoading: boolean;
  phaseKey: string;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordings, setRecordings] = useState<Map<number, { blob: Blob; duration: number; url: string }>>(new Map());
  const { addRecording, assessmentId } = useAssessmentStore();
  const user = useAuthStore(s => s.user);
  const completionHandlerRef = useRef<((blob: Blob, duration: number) => void) | null>(null);
  const recordingsRef = useRef(recordings);
  const handleRecorderComplete = useCallback((blob: Blob, recordingDuration: number) => {
    completionHandlerRef.current?.(blob, recordingDuration);
  }, []);

  const {
    isRecording, analyserNode,
    startRecording, stopRecording, resetRecording
  } = useAudioRecorder({
    maxDuration: config.audio.maxDurationSeconds,
    onComplete: handleRecorderComplete,
  });

  const handleRecordComplete = useCallback(async (blob: Blob, dur: number) => {
    const url = URL.createObjectURL(blob);
    setRecordings(prev => {
      const next = new Map(prev);
      const old = next.get(currentIdx);
      if (old?.url) URL.revokeObjectURL(old.url);
      next.set(currentIdx, { blob, duration: dur, url });
      return next;
    });

    addRecording({
      sentenceId: sentences[currentIdx].sentenceId,
      blob,
      duration: dur,
      timestamp: new Date().toISOString(),
    });

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        assessmentId: assessmentId || '',
        sentenceId: sentences[currentIdx].sentenceId,
        phase: phaseKey,
        duration: dur,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save offline', err);
    }
    toast.success('Ghi âm thành công!', `Câu ${currentIdx + 1} đã được ghi.`);
    
    if (currentIdx < sentences.length - 1) {
       setTimeout(() => {
         setCurrentIdx(i => i + 1);
         resetRecording();
       }, 500);
    }
  }, [currentIdx, sentences, addRecording, user, assessmentId, phaseKey, resetRecording]);

  useEffect(() => {
    completionHandlerRef.current = handleRecordComplete;
    return () => {
      completionHandlerRef.current = null;
    };
  }, [handleRecordComplete]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  useEffect(() => {
    return () => {
      recordingsRef.current.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, []);

  const goToSentence = (idx: number) => {
    setCurrentIdx(idx);
    resetRecording();
  };

  if (!sentences || sentences.length === 0) {
    return <div className="text-center p-8">Đang tải dữ liệu câu hỏi...</div>;
  }

  const allDone = recordings.size === sentences.length;

  const idleWaveform = [16, 32, 20, 48, 24, 8, 32, 16, 4, 20, 40, 12, 32, 24, 16, 28];

  return (
    <div className="assessment-workflow">
      <header className="assessment-header">
        <div className="assessment-header__copy">
          <div className="assessment-status">
            <span className="material-symbols-outlined" aria-hidden="true">headphones</span>
            Đang tiến hành
          </div>
          <h1>Đánh giá Phát âm</h1>
          <p>{subtitle} Hãy đảm bảo bạn đang ở môi trường yên tĩnh.</p>
        </div>

        <div className="assessment-progress" aria-label={`${recordings.size} trên ${sentences.length} câu đã hoàn thành`}>
          <div className="assessment-progress__label">
            <span>Tiến độ {title}</span>
            <strong>{recordings.size}/{sentences.length}</strong>
          </div>
          <div className="assessment-progress__track">
            <span style={{ width: `${(recordings.size / sentences.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="assessment-grid">
        <aside className="assessment-sentences" aria-label="Danh sách câu đánh giá">
          {sentences.map((sent, idx) => {
            const recorded = recordings.has(idx);
            const active = currentIdx === idx;

            return (
              <button
                type="button"
                key={sent.sentenceId}
                onClick={() => goToSentence(idx)}
                className={`assessment-sentence${active ? ' is-active' : ''}${recorded && !active ? ' is-complete' : ''}`}
                aria-current={active ? 'step' : undefined}
              >
                <span className="assessment-sentence__number">
                  {recorded && !active ? (
                    <span className="material-symbols-outlined" aria-hidden="true">check</span>
                  ) : idx + 1}
                </span>
                <span className="assessment-sentence__content">
                  <span className="assessment-sentence__text">{sent.text}</span>
                  {active && <span className="assessment-sentence__state">Đang thực hiện</span>}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="assessment-recorder" aria-labelledby="current-sentence-heading">
          <div className="assessment-recorder__topbar">
            <h2 id="current-sentence-heading">Câu số {currentIdx + 1}</h2>
            <button type="button" className="assessment-help">
              <span className="material-symbols-outlined" aria-hidden="true">help</span>
              Hướng dẫn
            </button>
          </div>

          <div className="assessment-recorder__body">
            <h3>“{sentences[currentIdx].text}”</h3>

            <div className="assessment-phonetic">
              <span className="material-symbols-outlined" aria-hidden="true">translate</span>
              /moj ɓwoj saŋ, toj tʰwəŋ uoŋ mot tat ka fe noŋ/
            </div>

            <div className={`assessment-waveform${isRecording ? ' is-recording' : ''}`}>
              {isRecording ? (
                <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} width={430} height={54} barColor="#33618d" />
              ) : (
                <>
                  {idleWaveform.slice(0, 8).map((height, idx) => <i key={`before-${idx}`} style={{ height }} />)}
                  <span>Sẵn sàng ghi âm</span>
                  {idleWaveform.slice(8).map((height, idx) => <i key={`after-${idx}`} style={{ height }} />)}
                </>
              )}
            </div>

            <div className="assessment-controls">
              <button type="button" className="assessment-control" aria-label="Nghe câu mẫu">
                <span className="material-symbols-outlined" aria-hidden="true">volume_up</span>
              </button>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`assessment-record${isRecording ? ' is-recording' : ''}`}
                aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              >
                <span className="material-symbols-outlined" aria-hidden="true">{isRecording ? 'square' : 'mic'}</span>
              </button>
              <button
                type="button"
                onClick={() => currentIdx < sentences.length - 1 ? goToSentence(currentIdx + 1) : null}
                disabled={currentIdx === sentences.length - 1}
                className="assessment-control"
                aria-label="Bỏ qua câu này"
              >
                <span className="material-symbols-outlined" aria-hidden="true">skip_next</span>
              </button>
            </div>
          </div>

          {allDone && currentIdx === sentences.length - 1 && (
            <button type="button" onClick={onComplete} disabled={isLoading} className="assessment-complete">
              {isLoading ? 'Đang gửi...' : 'Hoàn thành giai đoạn'}
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

function LocalUploadAssessment() {
  const localModel = useLocalVoiceModel();

  return (
    <LocalVoiceCheck
      status={localModel.status}
      progress={localModel.progress}
      result={localModel.result}
      error={localModel.error}
      isCached={localModel.isCached}
      onAnalyze={localModel.analyze}
      onRetry={localModel.retry}
      onReset={localModel.reset}
    />
  );
}

function StorytellingPhase({ sentences, onComplete, isLoading }: { sentences: AssessmentSentence[], onComplete: () => void, isLoading: boolean }) {
  const [recorded, setRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const user = useAuthStore(s => s.user);
  const { addRecording, assessmentId } = useAssessmentStore();
  
  const mainPrompt = "Hôm nay của bạn thế nào? Hãy kể về một việc bạn thấy thú vị nhất hôm nay (nên kể khoảng 1-2 phút).";

  const handleRecordComplete = useCallback(async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setRecorded(true);

    addRecording({
      sentenceId: sentences[0]?.sentenceId || 'phase_3_storytelling',
      blob,
      duration,
      timestamp: new Date().toISOString(),
    });

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        assessmentId: assessmentId || '',
        sentenceId: sentences[0]?.sentenceId || 'phase_3_storytelling',
        phase: 'phase_3',
        duration,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save offline', err);
    }
    toast.success('Ghi âm hoàn tất!', 'Bài kể chuyện của bạn đã được lưu.');
  }, [addRecording, user, assessmentId, sentences]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="max-w-[800px] mx-auto text-center py-12 px-4">
      <h2 className="font-display-lg font-bold tracking-tight mb-4 text-on-surface">
        Giai đoạn III — Kể chuyện tự do
      </h2>
      <p className="font-body-lg text-on-surface-variant mb-10">
        Hãy kể một câu chuyện sinh hoạt hằng ngày của bạn (vui lòng chia sẻ chi tiết một chút). Chúng tôi sẽ đánh giá chuyên sâu về phát âm, hơi thở, âm điệu, giọng chuyển và mức độ tự tin.
      </p>

      <div className="bg-surface-lowest organic-curve p-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent mb-10">
        <p className="font-headline-md italic text-on-surface leading-relaxed mb-4">
          "{mainPrompt}"
        </p>
        <div className="text-body-md text-on-surface-variant text-left bg-surface-container-low p-4 rounded-xl inline-block max-w-[500px]">
          <p className="font-bold mb-2">Gợi ý mở rộng:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bạn đã gặp ai và trò chuyện về điều gì?</li>
            <li>Cảm xúc của bạn lúc đó ra sao?</li>
            <li>Bạn rút ra được điều gì từ sự việc đó?</li>
          </ul>
        </div>
      </div>

      <div className="bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent mb-10">
        <AudioRecorder
          onRecordingComplete={handleRecordComplete}
          maxDuration={config.audio.maxDurationSeconds}
          minDuration={config.audio.minStorytellingDuration}
          showPlayback
        />
      </div>

      {recorded && audioUrl && (
        <div className="mb-10 animate-fade-in">
          <AudioPlayer src={audioUrl} label="Bài kể chuyện của bạn" />
        </div>
      )}

      <div className="text-center">
        <button
          className={`bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 mx-auto ${(!recorded || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-fixed-variant hover:shadow-lg hover:-translate-y-0.5'}`}
          disabled={!recorded || isLoading}
          onClick={onComplete}
        >
          <CheckCircle size={20} /> {isLoading ? 'Đang nộp...' : 'Hoàn thành bài test'}
        </button>
        {!recorded && (
          <p className="font-body-sm text-on-surface-variant mt-4 opacity-80">
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
    
    const checkInterval = setInterval(() => {
      if (phase === 'processing') checkStatus();
    }, 5000);

    return () => {
      clearInterval(textInterval);
      clearInterval(checkInterval);
    };
  }, [checkStatus, phase]);

  return (
    <div className="max-w-[500px] mx-auto text-center py-20 px-4 animate-scale-in">
      <div className="w-16 h-16 border-4 border-surface-container-high border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
      <h2 className="font-display-sm font-bold mb-4 text-on-surface">Hệ thống đang phân tích</h2>
      <p className="font-body-lg text-on-surface-variant mb-2">Vui lòng đợi kết quả sàng lọc khoảng 2-3 phút...</p>
      <p className="font-body-sm text-on-surface-variant opacity-80 mb-8">(Hệ thống AI và Chuyên gia đang tiến hành đánh giá chuyên sâu. Hiện trạng thái: {statusText})</p>
      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-6">
        <div className="bg-primary h-full w-1/2 animate-pulse rounded-full"></div>
      </div>
    </div>
  );
}

function ResultsPhase() {
  const navigate = useNavigate();
  const { result } = useAssessmentStore();
  const updateUser = useAuthStore(s => s.updateUser);
  
  useEffect(() => {
    if (result) updateUser({ assessmentCompleted: true, currentPathwayId: result.recommendedPathwayId });
  }, [result, updateUser]);

  if (!result) return <div className="text-center p-12 font-body-lg">Đang tải kết quả...</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-[#006e1c]';
    return 'text-error';
  };

  const overallScore = result.overallScore ?? 0;
  const pronunciationIssues = result.pronunciationIssues ?? [];

  return (
    <div className="max-w-[800px] mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-12">
        <div className="text-5xl mb-6">📊</div>
        <h2 className="font-display-lg font-bold tracking-tight text-on-surface mb-2">Kết quả <span className="text-primary">GOODVIET Check</span></h2>
        <p className="font-body-lg text-on-surface-variant">Kết quả phân tích từ AI và Chuyên gia</p>
      </div>

      {result.audioUrl && (
        <div className="bg-surface-lowest organic-curve p-6 mb-8 border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col items-center">
           <h3 className="font-headline-sm font-bold text-on-surface mb-4">Đoạn ghi âm của bạn</h3>
           <audio controls src={result.audioUrl} className="w-full max-w-[400px]" />
        </div>
      )}

      <div className="bg-surface-lowest organic-curve p-10 text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent mb-8">
        <div className={`font-display-lg text-[80px] font-bold mb-2 leading-none ${getScoreColor(overallScore)}`}>
          {overallScore}
        </div>
        <div className="font-label-lg text-on-surface-variant">Điểm tổng thể / 100</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Phát âm rõ ràng', value: result.clarityScore ?? 0 },
          { label: 'Độ trôi chảy', value: result.fluencyScore ?? 0 },
          { label: 'Tốc độ nói', value: `${result.speechRate ?? 0} wpm` },
          { label: 'Mức tự tin', value: result.confidenceLevel === 'high' ? 'Cao' : result.confidenceLevel === 'medium' ? 'Trung bình' : result.confidenceLevel === 'low' ? 'Thấp' : 'Chưa xác định' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-lowest organic-curve p-6 border border-transparent text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform cursor-default">
            <div className="font-label-md text-on-surface-variant mb-2">{s.label}</div>
            <div className="font-headline-md font-bold text-on-surface">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface-lowest organic-curve p-8 border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
             <AlertTriangle size={20} />
          </div>
          <span className="font-headline-sm font-bold text-on-surface">Các vấn đề phát âm phát hiện</span>
        </div>
        <div className="flex flex-col gap-4">
          {pronunciationIssues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-surface-container-low organic-curve border border-transparent hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-shadow">
              <div>
                <div className="font-title-md font-bold text-on-surface mb-1">Phụ âm {issue.phoneme.toUpperCase()}</div>
                <div className="font-body-sm text-on-surface-variant">{issue.description}</div>
              </div>
              <span className={`px-4 py-1.5 rounded-full font-label-md font-bold ${
                issue.severity === 'severe' ? 'bg-error-container text-on-error-container' : 
                issue.severity === 'moderate' ? 'bg-tertiary-container text-on-tertiary-container' : 
                'bg-primary-container text-on-primary-container'
              }`}>
                {issue.severity === 'severe' ? 'Nặng' : issue.severity === 'moderate' ? 'Trung bình' : 'Nhẹ'}
              </span>
            </div>
          ))}
          {pronunciationIssues.length === 0 && (
             <div className="text-center font-body-md text-on-surface-variant p-4">Tuyệt vời! Không phát hiện lỗi phát âm nghiêm trọng.</div>
          )}
        </div>
      </div>

      <div className="bg-inverse-surface rounded-3xl p-10 text-inverse-on-surface text-center shadow-lg organic-curve">
        <h3 className="font-headline-md font-bold mb-4">🎯 Lộ trình được đề xuất</h3>
        <p className="font-body-md text-inverse-on-surface/80 mb-8 max-w-[500px] mx-auto">
          Dựa trên kết quả phân tích, chúng tôi đã tạo lộ trình cá nhân hóa cho bạn.
        </p>
        <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-md hover:bg-primary-fixed-variant hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => navigate('/pathway')}>
          Bắt đầu lộ trình luyện tập →
        </button>
      </div>
    </div>
  );
}

export function AssessmentPage() {
  const user = useAuthStore(s => s.user);
  const { phase, sentences, isLoading, startAssessment, completeCurrentPhase, loadResult } = useAssessmentStore();

  useEffect(() => {
    if (user?.assessmentCompleted && phase === 'not_started') {
      loadResult();
    }
  }, [user?.assessmentCompleted, phase, loadResult]);

  if (user?.assessmentCompleted && phase !== 'results') {
    return (
      <main className="flex-1 ml-nav-rail-width min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface-lowest rounded-3xl p-12 text-center shadow-sm border border-outline-variant/20 max-w-[600px] w-full">
          <CheckCircle size={64} className="text-primary mx-auto mb-6" />
          <h2 className="font-display-sm font-bold text-on-surface mb-4">Bạn đã hoàn thành GOODVIET Check</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">Mỗi tài khoản chỉ được làm bài test 1 lần duy nhất.</p>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary-fixed-variant" onClick={() => loadResult()}>
            Xem lại kết quả
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="assessment-page flex-1 ml-nav-rail-width min-h-screen bg-background">
      <div className="assessment-page__content">
        {(phase === 'not_started' || phase === 'intro') && (
          <div className="pt-20">
             <IntroPhase onStart={startAssessment} isLoading={isLoading} />
             <LocalUploadAssessment />
          </div>
        )}

        {phase === 'phase_1' && (
          <SentenceRecording
            sentences={sentences}
            title="Giai đoạn I"
            subtitle="Đọc to và rõ ràng các câu dưới đây. Hệ thống sẽ phân tích ngữ điệu và độ chính xác của bạn."
            onComplete={completeCurrentPhase}
            isLoading={isLoading}
            phaseKey="phase_1"
          />
        )}

        {phase === 'phase_2' && (
          <SentenceRecording
            sentences={sentences}
            title="Giai đoạn II"
            subtitle="Đọc lại các câu có lỗi phát hiện ở Giai đoạn I để xác nhận"
            onComplete={completeCurrentPhase}
            isLoading={isLoading}
            phaseKey="phase_2"
          />
        )}

        {phase === 'phase_3' && (
          <div className="pt-10">
             <StorytellingPhase sentences={sentences} onComplete={completeCurrentPhase} isLoading={isLoading} />
          </div>
        )}

        {phase === 'processing' && <div className="pt-20"><ProcessingPhase /></div>}
        {phase === 'results' && <div className="pt-10"><ResultsPhase /></div>}
      </div>
    </main>
  );
}
