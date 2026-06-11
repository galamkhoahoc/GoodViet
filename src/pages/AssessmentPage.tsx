import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Play, ChevronRight, CheckCircle, AlertTriangle, Mic, Square, Volume2, Info, RotateCcw } from 'lucide-react';
import { config } from '../config/env';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

function IntroPhase({ onStart, isLoading }: { onStart: () => void, isLoading: boolean }) {
  return (
    <div className="max-w-[700px] mx-auto text-center bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
      <div className="text-5xl mb-6">🎙️</div>
      <h2 className="text-3xl font-bold mb-4 text-[#191d17]">
        <span className="text-[#386a20]">GOODVIET Check</span> — Bài test sàng lọc giọng nói
      </h2>
      <p className="text-[#42493c] mb-8 leading-relaxed text-lg">
        Bài test gồm <strong>3 giai đoạn</strong> giúp phân tích chuyên sâu bởi AI và Chuyên gia:
      </p>
      
      <div className="flex flex-col gap-4 text-left max-w-[500px] mx-auto mb-8">
        {[
          { num: 'I', text: 'Đọc 12 câu văn ngắn kiểm tra các lỗi phát âm cơ bản' },
          { num: 'II', text: 'Đọc lại các câu bị sai + câu bổ sung để xác nhận lỗi' },
          { num: 'III', text: 'Kể chuyện tự do để đánh giá toàn diện giọng nói' },
        ].map(item => (
          <div key={item.num} className="p-4 flex gap-4 items-center bg-[#f2f5eb] rounded-2xl">
            <span className="text-sm font-bold px-3 py-1 bg-[#d8e7cb] text-[#205107] rounded-full shrink-0">
              {item.num}
            </span>
            <span className="text-base text-[#191d17]">
              {item.text}
            </span>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-[#42493c] mb-8 opacity-80">
        ⚠️ Mỗi tài khoản chỉ được làm bài test này <strong>1 lần duy nhất</strong>. Hãy chuẩn bị ở nơi yên tĩnh.
      </p>
      
      <button
        onClick={onStart}
        disabled={isLoading}
        className={`w-full max-w-[300px] py-4 px-6 bg-[#386a20] text-white rounded-full font-bold flex items-center justify-center gap-2 mx-auto shadow-md transition-all hover:bg-[#2d561a] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
    } catch (err) {}
    toast.success('Ghi âm thành công!', `Câu ${currentIdx + 1} đã được ghi.`);
    
    if (currentIdx < sentences.length - 1) {
       setTimeout(() => {
         setCurrentIdx(i => i + 1);
         resetRecording();
       }, 500);
    }
  }, [currentIdx, sentences, addRecording, user?.userId, assessmentId, phaseKey, resetRecording]);

  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleRecordComplete(audioBlob, duration);
    }
  }, [audioBlob, isRecording, handleRecordComplete, duration]);

  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
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
  const isRecorded = recordings.has(currentIdx);

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto p-4 md:p-8 lg:p-12 gap-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
             <div className="bg-[#386666] inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                ĐANG TIẾN HÀNH
             </div>
             <h1 className="text-[#191d17] text-4xl md:text-5xl font-plus-jakarta tracking-tight mb-2 font-medium">{title}</h1>
             <p className="text-[#42493c] text-base">{subtitle}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm p-4 w-[200px] border border-[#e0e4da] shrink-0">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[#42493c] text-sm font-medium">Tiến độ</span>
                <span className="text-[#205107] font-bold">{recordings.size}/{sentences.length}</span>
             </div>
             <div className="w-full bg-[#e0e4da] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#386a20] h-full transition-all duration-300" style={{ width: `${(recordings.size / sentences.length) * 100}%` }}></div>
             </div>
          </div>
       </div>

       {/* Bento Layout */}
       <div className="grid grid-cols-12 gap-6 h-[635px]">
          {/* Left List */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-3 overflow-y-auto pr-2 h-full pb-20 md:pb-0 custom-scrollbar">
             {sentences.map((sent, idx) => {
                const recorded = recordings.has(idx);
                const active = currentIdx === idx;
                
                let cardClass = "bg-white p-4 rounded-xl flex gap-4 items-start border border-[#e0e4da] transition-all cursor-pointer hover:bg-gray-50";
                let iconClass = "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors";
                
                if (active) {
                   cardClass = "bg-white p-4 rounded-xl flex gap-4 items-start border-2 border-[#386a20] shadow-md relative";
                   iconClass += " bg-[#386a20] text-white";
                } else if (recorded) {
                   cardClass += " opacity-75";
                   iconClass += " bg-[#d8e7cb] text-[#205107]";
                } else {
                   iconClass += " bg-[#e0e4da] text-[#42493c]";
                }

                return (
                   <div key={sent.id} className={cardClass} onClick={() => goToSentence(idx)}>
                      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#386a20] rounded-l-xl"></div>}
                      <div className={iconClass}>
                         {recorded && !active ? <CheckCircle size={16} /> : (idx + 1)}
                      </div>
                      <div className="flex-1">
                         <p className={`text-sm ${active ? 'text-[#191d17] font-bold' : 'text-[#42493c]'}`}>{sent.text}</p>
                         {active && <div className="mt-2 inline-block bg-[#b8f398]/30 px-2 py-0.5 rounded text-xs font-semibold text-[#205107]">Đang thực hiện</div>}
                      </div>
                   </div>
                );
             })}
          </div>

          {/* Right Canvas */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-3xl border border-[#e6e9df] shadow-sm flex flex-col justify-between p-6 md:p-10 h-full relative overflow-hidden">
             <div className="border-b border-[#ecefe5] pb-4 flex justify-between items-center shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-[#191d17]">Câu số {currentIdx + 1}</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 text-[#205107] text-sm font-semibold transition-colors">
                   <Info size={16} /> Hướng dẫn
                </button>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-10 overflow-y-auto">
                <p className="text-3xl md:text-[40px] leading-tight font-medium text-[#191d17] mb-6">"{sentences[currentIdx].text}"</p>
                <div className="bg-[#f2f5eb] inline-flex items-center gap-2 px-4 py-2 rounded-lg opacity-80">
                   <Volume2 size={16} className="text-[#42493c]" />
                   <span className="text-sm font-medium tracking-wide text-[#42493c]">Nhấn bắt đầu ghi âm để đọc câu này</span>
                </div>
             </div>

             <div className="flex flex-col items-center mt-auto shrink-0 pb-4">
                <div className="h-24 w-full max-w-md bg-[#f2f5eb] rounded-2xl flex items-center justify-center mb-8 overflow-hidden">
                   {isRecording ? (
                      <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} width={300} height={48} barColor="#386a20" />
                   ) : (
                      <span className="text-[#c3c8bc] text-sm font-semibold uppercase tracking-wider">Sẵn sàng ghi âm</span>
                   )}
                </div>

                <div className="flex items-center gap-6 md:gap-10">
                   <button 
                      onClick={() => currentIdx > 0 ? goToSentence(currentIdx - 1) : null}
                      disabled={currentIdx === 0}
                      className="w-12 h-12 rounded-full bg-[#ecefe5] flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      title="Câu trước"
                   >
                      <ChevronRight size={20} className="text-[#42493c] rotate-180" />
                   </button>
                   <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-[#386a20] shadow-lg shadow-[#386a20]/30 hover:scale-105'}`}
                   >
                      {isRecording ? <Square size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                   </button>
                   <button 
                      onClick={() => currentIdx < sentences.length - 1 ? goToSentence(currentIdx + 1) : null}
                      disabled={currentIdx === sentences.length - 1}
                      className="w-12 h-12 rounded-full bg-[#ecefe5] flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      title="Câu tiếp"
                   >
                      <ChevronRight size={20} className="text-[#42493c]" />
                   </button>
                </div>
             </div>

             {/* Complete Button Overlay if all done */}
             {allDone && currentIdx === sentences.length - 1 && (
                <div className="absolute bottom-6 right-6 z-10 animate-fade-in-up">
                   <button onClick={onComplete} disabled={isLoading} className="bg-[#386a20] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#2d561a] transition-colors flex items-center gap-2">
                      {isLoading ? 'Đang gửi...' : 'Hoàn thành giai đoạn'} <CheckCircle size={20} />
                   </button>
                </div>
             )}
          </div>
       </div>
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
    } catch (err) {}
    toast.success('Ghi âm hoàn tất!', 'Bài kể chuyện của bạn đã được lưu.');
  }, [addRecording, user?.userId, assessmentId, sentences]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="max-w-[800px] mx-auto text-center py-12 px-4">
      <h2 className="text-3xl font-bold mb-4 text-[#191d17]">
        Giai đoạn III — Kể chuyện tự do
      </h2>
      <p className="text-[#42493c] mb-10">
        Hãy kể về câu chuyện hàng ngày của bạn. Chúng tôi sẽ đánh giá phát âm, hơi thở, âm điệu và sự tự tin.
      </p>

      <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#e0e4da] mb-10">
        <p className="text-2xl font-medium italic text-[#191d17] leading-relaxed">
          "{mainPrompt}"
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e0e4da] mb-10">
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
          className={`bg-[#386a20] text-white px-8 py-4 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 mx-auto ${(!recorded || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2d561a]'}`}
          disabled={!recorded || isLoading}
          onClick={onComplete}
        >
          <CheckCircle size={20} /> {isLoading ? 'Đang nộp...' : 'Hoàn thành bài test'}
        </button>
        {!recorded && (
          <p className="text-sm text-[#42493c] mt-4 opacity-80">
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
      <div className="w-16 h-16 border-4 border-[#e0e4da] border-t-[#386a20] rounded-full animate-spin mx-auto mb-8"></div>
      <h2 className="text-3xl font-bold mb-4 text-[#191d17]">Hệ thống đang phân tích</h2>
      <p className="text-[#42493c] mb-8">{statusText}</p>
      <div className="w-full bg-[#e0e4da] h-2 rounded-full overflow-hidden mb-6">
        <div className="bg-[#386a20] h-full w-1/2 animate-pulse rounded-full"></div>
      </div>
      <p className="text-sm text-[#42493c] opacity-80">
        Dữ liệu đang được đánh giá bởi cả hệ thống AI và đội ngũ Chuyên gia GOODVIET.
      </p>
    </div>
  );
}

function ResultsPhase() {
  const { result } = useAssessmentStore();
  const updateUser = useAuthStore(s => s.updateUser);
  
  useEffect(() => {
    if (result) updateUser({ assessmentCompleted: true, currentPathwayId: result.recommendedPathwayId });
  }, [result, updateUser]);

  if (!result) return <div className="text-center p-12">Đang tải kết quả...</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#386a20]';
    if (score >= 60) return 'text-[#006e1c]';
    return 'text-red-600';
  };

  return (
    <div className="max-w-[800px] mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-12">
        <div className="text-5xl mb-6">📊</div>
        <h2 className="text-3xl font-bold text-[#191d17] mb-2">Kết quả <span className="text-[#386a20]">GOODVIET Check</span></h2>
        <p className="text-[#42493c]">Kết quả phân tích từ AI</p>
      </div>

      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-[#e0e4da] mb-8">
        <div className={`text-7xl font-bold mb-2 ${getScoreColor(result.overallScore)}`}>
          {result.overallScore}
        </div>
        <div className="text-[#42493c] font-medium">Điểm tổng thể / 100</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Phát âm rõ ràng', value: result.clarityScore },
          { label: 'Độ trôi chảy', value: result.fluencyScore },
          { label: 'Tốc độ nói', value: `${result.speechRate} wpm` },
          { label: 'Mức tự tin', value: result.confidenceLevel === 'high' ? 'Cao' : result.confidenceLevel === 'medium' ? 'Trung bình' : 'Thấp' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#e0e4da] text-center shadow-sm">
            <div className="text-sm text-[#42493c] mb-2">{s.label}</div>
            <div className="text-2xl font-bold text-[#191d17]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#e0e4da] shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={24} className="text-[#ba1a1a]" />
          <span className="text-xl font-bold text-[#191d17]">Các vấn đề phát âm phát hiện</span>
        </div>
        <div className="flex flex-col gap-4">
          {result.pronunciationIssues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#f2f5eb] rounded-xl border border-[#e0e4da]">
              <div>
                <div className="font-bold text-[#191d17]">Phụ âm {issue.phoneme.toUpperCase()}</div>
                <div className="text-sm text-[#42493c] mt-1">{issue.description}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                issue.severity === 'severe' ? 'bg-[#ffdad6] text-[#410002]' : 
                issue.severity === 'moderate' ? 'bg-[#ffdf99] text-[#261900]' : 
                'bg-[#c4ecd0] text-[#00210e]'
              }`}>
                {issue.severity === 'severe' ? 'Nặng' : issue.severity === 'moderate' ? 'Trung bình' : 'Nhẹ'}
              </span>
            </div>
          ))}
          {result.pronunciationIssues.length === 0 && (
             <div className="text-center text-[#42493c] p-4">Tuyệt vời! Không phát hiện lỗi phát âm nghiêm trọng.</div>
          )}
        </div>
      </div>

      <div className="bg-[#191d17] rounded-3xl p-10 text-white text-center shadow-lg">
        <h3 className="text-2xl font-bold mb-4">🎯 Lộ trình được đề xuất</h3>
        <p className="text-gray-300 mb-8 max-w-[500px] mx-auto">
          Dựa trên kết quả phân tích, chúng tôi đã tạo lộ trình cá nhân hóa cho bạn.
        </p>
        <button className="bg-[#b8f398] text-[#0b2000] px-8 py-4 rounded-full font-bold hover:bg-[#a2db84] transition-colors" onClick={() => { window.location.href = '/pathway'; }}>
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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#e0e4da] max-w-[600px] w-full">
          <CheckCircle size={64} className="text-[#386a20] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#191d17] mb-4">Bạn đã hoàn thành GOODVIET Check</h2>
          <p className="text-[#42493c] mb-8">Mỗi tài khoản chỉ được làm bài test 1 lần duy nhất.</p>
          <button className="bg-[#386a20] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#2d561a]" onClick={() => loadResult()}>
            Xem lại kết quả
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fdfdf5] font-plus-jakarta pb-20">
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
  );
}
