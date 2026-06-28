import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Play, ChevronRight, CheckCircle, AlertTriangle, Mic, Square, Volume2, Info, RotateCcw, Languages } from 'lucide-react';
import { config } from '../config/env';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

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
  sentences: { id: string; text: string }[];
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

  const {
    isRecording, duration, audioBlob, audioUrl, analyserNode,
    startRecording, stopRecording, resetRecording
  } = useAudioRecorder({
    maxDuration: config.audio.maxDurationSeconds,
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
      sentenceId: sentences[currentIdx].id,
      blob,
      duration: dur,
      timestamp: new Date().toISOString(),
    });

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        assessmentId: assessmentId || '',
        sentenceId: sentences[currentIdx].id,
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
    if (audioBlob && !isRecording) {
      handleRecordComplete(audioBlob, duration);
    }
  }, [audioBlob, isRecording, handleRecordComplete, duration]);

  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, [recordings]);

  const goToSentence = (idx: number) => {
    setCurrentIdx(idx);
    resetRecording();
  };

  if (!sentences || sentences.length === 0) {
    return <div className="text-center p-8">Đang tải dữ liệu câu hỏi...</div>;
  }

  const allDone = recordings.size === sentences.length;

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8 h-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-teal-800 text-teal-100 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[14px]">headphones</span>
            Đang tiến hành
          </div>
          <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight mb-2">{title}</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">{subtitle}</p>
        </div>
        <div className="bg-surface-lowest px-6 py-4 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-end">
           <div className="font-label-lg text-on-surface mb-2">Tiến độ {title} <span className="font-bold text-primary ml-2">{recordings.size}/{sentences.length}</span></div>
           <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden flex">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(recordings.size / sentences.length) * 100}%` }}></div>
           </div>
        </div>
      </div>

      <div className="flex flex-1 gap-8 mt-4 h-[600px]">
        {/* List of Sentences */}
        <div className="w-[380px] flex flex-col gap-4 overflow-y-auto pr-2 pb-12">
          {sentences.map((sent, idx) => {
            const recorded = recordings.has(idx);
            const active = currentIdx === idx;

            if (active) {
              return (
                <div key={sent.id} onClick={() => goToSentence(idx)} className="bg-surface-lowest p-5 rounded-2xl border-2 border-primary shadow-md flex items-center gap-4 relative cursor-pointer">
                   <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-md"></div>
                   <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                     {idx + 1}
                   </div>
                   <div className="flex-1">
                     <p className="font-title-md font-bold text-on-surface mb-1">{sent.text}</p>
                     <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">Đang thực hiện</span>
                   </div>
                </div>
              );
            }

            if (recorded) {
              return (
                <div key={sent.id} onClick={() => goToSentence(idx)} className="bg-surface-lowest p-5 rounded-xl border border-outline-variant/20 flex items-center gap-4 opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
                     <span className="material-symbols-outlined text-[16px]">check</span>
                   </div>
                   <p className="text-body-md text-on-surface flex-1 line-clamp-2">{sent.text}</p>
                </div>
              );
            }

            return (
              <div key={sent.id} onClick={() => goToSentence(idx)} className="bg-surface-lowest p-5 rounded-xl border border-outline-variant/20 flex items-center gap-4 opacity-50 cursor-pointer hover:opacity-80 transition-opacity">
                 <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant shrink-0">
                   {idx + 1}
                 </div>
                 <p className="text-body-md text-on-surface-variant flex-1 line-clamp-2">{sent.text}</p>
              </div>
            );
          })}
        </div>

        {/* Active View */}
        <div className="flex-1 bg-surface-lowest organic-curve shadow-sm border border-outline-variant/20 flex flex-col p-10 relative">
           <div className="flex justify-between items-center w-full mb-16">
             <span className="font-headline-sm font-bold">Câu số {currentIdx + 1}</span>
             <button className="text-primary font-label-md flex items-center gap-1 hover:underline">
               <span className="material-symbols-outlined text-[18px]">help</span> Hướng dẫn
             </button>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center w-full gap-8">
              <h3 className="font-display-md text-display-md leading-tight text-on-surface">"{sentences[currentIdx].text}"</h3>
              
              <div className="w-full bg-surface-container-low rounded-2xl h-24 mt-8 flex items-center justify-center relative overflow-hidden">
                 {isRecording ? (
                    <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} width={400} height={48} barColor="#3b6990" />
                 ) : (
                    <span className="mx-4 text-sm font-medium text-on-surface-variant uppercase tracking-widest">Sẵn sàng ghi âm</span>
                 )}
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <button className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm">
                   <span className="material-symbols-outlined text-[24px]">volume_up</span>
                </button>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-on-primary shadow-lg hover:scale-105 transition-transform group ${isRecording ? 'bg-error' : 'bg-primary'}`}
                >
                   {isRecording ? <span className="material-symbols-outlined text-[32px]">square</span> : <span className="material-symbols-outlined text-[32px] group-hover:animate-pulse">mic</span>}
                </button>
                <button 
                  onClick={() => currentIdx < sentences.length - 1 ? goToSentence(currentIdx + 1) : null}
                  disabled={currentIdx === sentences.length - 1}
                  className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm disabled:opacity-50"
                >
                   <span className="material-symbols-outlined text-[24px]">skip_next</span>
                </button>
              </div>
           </div>

           {/* Complete Button Overlay if all done */}
           {allDone && currentIdx === sentences.length - 1 && (
              <div className="absolute bottom-10 right-10 z-10 animate-fade-in-up">
                 <button onClick={onComplete} disabled={isLoading} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary-fixed-variant transition-colors flex items-center gap-2">
                    {isLoading ? 'Đang gửi...' : 'Hoàn thành giai đoạn'} <span className="material-symbols-outlined">check_circle</span>
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}

import type { AssessmentSentence } from '../services/api/assessmentApi';

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
        <div className={`font-display-lg text-[80px] font-bold mb-2 leading-none ${getScoreColor(result.overallScore)}`}>
          {result.overallScore}
        </div>
        <div className="font-label-lg text-on-surface-variant">Điểm tổng thể / 100</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Phát âm rõ ràng', value: result.clarityScore },
          { label: 'Độ trôi chảy', value: result.fluencyScore },
          { label: 'Tốc độ nói', value: `${result.speechRate} wpm` },
          { label: 'Mức tự tin', value: result.confidenceLevel === 'high' ? 'Cao' : result.confidenceLevel === 'medium' ? 'Trung bình' : 'Thấp' },
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
          {result.pronunciationIssues.map((issue, i) => (
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
          {result.pronunciationIssues.length === 0 && (
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
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background">
      <div className="max-w-[1200px] mx-auto p-12 flex flex-col gap-8 h-screen">
        {(phase === 'not_started' || phase === 'intro') && (
          <div className="pt-20">
             <IntroPhase onStart={startAssessment} isLoading={isLoading} />
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
