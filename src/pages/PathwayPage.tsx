import { useState } from 'react';
import { mockPathways } from '../data/mockPathways';
import { useAuthStore } from '../store/authStore';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Route, Play, CheckCircle, Pause, Video, ChevronDown, ChevronUp } from 'lucide-react';
import type { Exercise } from '../data/mockPathways';

function DayExerciseCard({ exercise, onRecord }: { exercise: Exercise; onRecord: () => void }) {
  const typeLabels: Record<string, string> = {
    pronunciation: '🗣️ Phát âm', breathing: '💨 Hơi thở',
    tongue_placement: '👅 Đặt lưỡi', fluency: '🌊 Trôi chảy',
  };
  const diffColors: Record<string, string> = {
    easy: 'var(--gv-success)', medium: 'var(--gv-warning)', hard: 'var(--gv-error)',
  };
  const diffLabels: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

  return (
    <div className="card" style={{ marginBottom: 'var(--gv-space-md)' }}>
      <div className="flex items-center justify-between mb-md">
        <span className="badge badge-primary">{typeLabels[exercise.type] || exercise.type}</span>
        <span className="text-xs font-semibold" style={{ color: diffColors[exercise.difficulty] }}>● {diffLabels[exercise.difficulty]}</span>
      </div>
      <h4 className="font-semibold mb-sm">{exercise.title}</h4>
      <p className="text-sm text-secondary mb-md">{exercise.instructions}</p>
      <div className="card-glow" style={{ padding: 'var(--gv-space-md)', marginBottom: 'var(--gv-space-md)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--gv-font-size-lg)', fontWeight: 500, lineHeight: 1.8 }}>
          "{exercise.practiceText}"
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Lặp lại {exercise.repetitions} lần · ~{exercise.estimatedDuration} phút</span>
        <button className="btn btn-lime btn-sm" onClick={onRecord}>
          🎙️ Ghi âm
        </button>
      </div>
    </div>
  );
}

function RecordingModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const user = useAuthStore(s => s.user);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleRecordComplete = async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setRecordedUrl(url);

    // Save to IndexedDB
    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        exerciseId: exercise.exerciseId,
        duration,
        format: blob.type || 'audio/webm',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB:', err);
    }
  };

  const handleSave = () => {
    setSaved(true);
    toast.success('Ghi âm đã lưu!', exercise.title);
    setTimeout(onClose, 800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div className="card-positivus animate-scale-in" style={{ maxWidth: 500, width: '90%', background: 'var(--gv-white)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold mb-md">{exercise.title}</h3>
        <div className="card-glow text-center mb-lg" style={{ padding: 'var(--gv-space-md)' }}>
          <p style={{ fontSize: 'var(--gv-font-size-lg)', lineHeight: 1.8 }}>"{exercise.practiceText}"</p>
        </div>

        {!saved ? (
          <>
            <AudioRecorder
              onRecordingComplete={handleRecordComplete}
              maxDuration={300}
              showPlayback
              compact
            />

            <div className="flex justify-between mt-lg">
              <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
              {recordedUrl && (
                <button className="btn btn-success" onClick={handleSave}>
                  <CheckCircle size={14} /> Lưu & Tiếp tục
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center" style={{ padding: 'var(--gv-space-lg)' }}>
            <CheckCircle size={48} color="var(--gv-success)" style={{ margin: '0 auto var(--gv-space-md)' }} />
            <p className="font-semibold">Đã lưu thành công!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PathwayPage() {
  const pathway = mockPathways[0];
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [recordingExercise, setRecordingExercise] = useState<Exercise | null>(null);
  const [checkedIn, setCheckedIn] = useState<Set<number>>(new Set());

  const completedDays = pathway.weeklyPlans.flatMap(w => w.days).filter(d => d.completed).length;
  const totalDays = pathway.durationDays;
  const progress = Math.round((completedDays / totalDays) * 100);
  const currentWeek = pathway.weeklyPlans[selectedWeek];

  const handleCheckIn = (day: number) => {
    setCheckedIn(prev => new Set(prev).add(day));
    toast.success('Chấm công thành công!', `Ngày ${day} đã hoàn thành 🎉`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><Route size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> <span className="heading-highlight">{pathway.name}</span></h1>
        <p className="page-subtitle">{pathway.description}</p>
      </div>

      {/* Progress Overview */}
      <div className="card-positivus mb-lg">
        <div className="flex items-center justify-between mb-md">
          <span className="font-semibold">Tiến độ lộ trình</span>
          <span className="badge badge-dark">{progress}% hoàn thành</span>
        </div>
        <div className="progress-bar mb-md">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>{completedDays} / {totalDays} ngày</span>
          <span>Mức độ: <span className="font-semibold" style={{ color: 'var(--gv-warning)' }}>{pathway.severityLevel === 'moderate' ? 'Trung bình' : pathway.severityLevel === 'mild' ? 'Nhẹ' : 'Nặng'}</span></span>
        </div>
      </div>

      {/* Week Tabs */}
      <div className="flex gap-sm mb-lg" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {pathway.weeklyPlans.map((week, i) => (
          <button
            key={i}
            className={`btn ${selectedWeek === i ? 'btn-lime' : 'btn-secondary'}`}
            onClick={() => setSelectedWeek(i)}
          >
            Tuần {week.weekNumber}
          </button>
        ))}
      </div>

      {/* Weekly Video */}
      <div className="card-positivus mb-lg" style={{ borderLeft: '4px solid var(--gv-lime)' }}>
        <div className="flex items-center gap-md">
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--gv-radius-md)',
            background: 'var(--gv-lime)', border: '2px solid var(--gv-black)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Video size={24} color="#191A23" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="font-semibold">{currentWeek.videoTitle}</div>
            <div className="text-sm text-muted">{currentWeek.videoDescription}</div>
          </div>
          <button className="btn btn-primary btn-sm"><Play size={14} /> Xem video</button>
        </div>
      </div>

      {/* Daily Exercises */}
      <div className="flex flex-col gap-sm">
        {currentWeek.days.map((day) => {
          const isExpanded = expandedDay === day.day;
          const isDone = day.completed || checkedIn.has(day.day);

          return (
            <div key={day.day} className="card-positivus" style={{
              borderLeft: `4px solid ${day.isRestDay ? 'var(--gv-border)' : isDone ? 'var(--gv-success)' : 'var(--gv-black)'}`,
              opacity: day.isRestDay ? 0.6 : 1,
              boxShadow: isDone ? '0 5px 0 0 var(--gv-success)' : undefined,
            }}>
              <div
                className="flex items-center justify-between"
                style={{ cursor: day.isRestDay ? 'default' : 'pointer' }}
                onClick={() => !day.isRestDay && setExpandedDay(isExpanded ? null : day.day)}
              >
                <div className="flex items-center gap-md">
                  {isDone ? (
                    <CheckCircle size={20} color="var(--gv-success)" />
                  ) : day.isRestDay ? (
                    <Pause size={20} color="var(--gv-text-muted)" />
                  ) : (
                    <Play size={20} />
                  )}
                  <div>
                    <span className="font-semibold">Ngày {day.day}</span>
                    {day.isRestDay && <span className="text-sm text-muted"> — Ngày nghỉ 🌿</span>}
                    {isDone && !day.isRestDay && <span className="badge badge-success" style={{ marginLeft: 8 }}>Hoàn thành</span>}
                  </div>
                </div>
                {!day.isRestDay && (
                  <div className="flex items-center gap-sm">
                    <span className="text-xs text-muted">{day.exercises.length} bài tập</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                )}
              </div>

              {isExpanded && !day.isRestDay && (
                <div style={{ marginTop: 'var(--gv-space-lg)' }}>
                  {day.exercises.map(ex => (
                    <DayExerciseCard key={ex.exerciseId} exercise={ex} onRecord={() => setRecordingExercise(ex)} />
                  ))}
                  {!isDone && (
                    <button className="btn btn-success w-full mt-md" onClick={() => handleCheckIn(day.day)}>
                      <CheckCircle size={16} /> Chấm công — Hoàn thành ngày {day.day}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recordingExercise && (
        <RecordingModal exercise={recordingExercise} onClose={() => setRecordingExercise(null)} />
      )}
    </div>
  );
}
