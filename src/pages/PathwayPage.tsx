import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { practiceApi, PracticeProgress, PracticePathway, DayContent, DayExercise } from '../services/api/practiceApi';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { indexedDBService } from '../services/storage/indexedDB';
import { toast } from '../components/common/Toast';
import { Route, Play, CheckCircle, Pause, Video, ChevronDown, ChevronUp } from 'lucide-react';

function DayExerciseCard({ exercise, onRecord }: { exercise: DayExercise; onRecord: () => void }) {
  const typeLabels: Record<string, string> = {
    pronunciation: '🗣️ Phát âm', breathing: '💨 Hơi thở',
    tongue_placement: '👅 Đặt lưỡi', fluency: '🌊 Trôi chảy',
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--md-sys-space-md)' }}>
      <div className="flex items-center justify-between mb-md">
        <span className="badge badge-primary">{typeLabels[exercise.type] || exercise.type}</span>
      </div>
      <h4 className="font-semibold mb-sm">{exercise.title}</h4>
      <p className="text-sm text-secondary mb-md">{exercise.instructions}</p>
      {exercise.sentences && exercise.sentences.length > 0 && (
        <div className="card-glow" style={{ padding: 'var(--md-sys-space-md)', marginBottom: 'var(--md-sys-space-md)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--md-sys-typescale-title-small-size)', fontWeight: 500, lineHeight: 1.8 }}>
            "{exercise.sentences[0]}"
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Lặp lại theo hướng dẫn</span>
        <button className="btn btn-lime btn-sm" onClick={onRecord}>
          🎙️ Ghi âm
        </button>
      </div>
    </div>
  );
}

function RecordingModal({ exercise, week, day, onClose }: { exercise: DayExercise; week: number; day: number; onClose: () => void }) {
  const user = useAuthStore(s => s.user);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleRecordComplete = async (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setRecordedUrl(url);

    try {
      await indexedDBService.saveRecording(blob, {
        userId: user?.userId || 'anonymous',
        exerciseId: exercise.exerciseId,
        phase: `practice_w${week}_d${day}`,
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
      <div className="card-positivus animate-scale-in" style={{ maxWidth: 500, width: '90%', background: 'var(--md-sys-color-surface-container-lowest)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold mb-md">{exercise.title}</h3>
        {exercise.sentences && exercise.sentences.length > 0 && (
          <div className="card-glow text-center mb-lg" style={{ padding: 'var(--md-sys-space-md)' }}>
            <p style={{ fontSize: 'var(--md-sys-typescale-title-small-size)', lineHeight: 1.8 }}>"{exercise.sentences[0]}"</p>
          </div>
        )}

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
          <div className="text-center" style={{ padding: 'var(--md-sys-space-lg)' }}>
            <CheckCircle size={48} color="var(--md-sys-color-primary)" style={{ margin: '0 auto var(--md-sys-space-md)' }} />
            <p className="font-semibold">Đã lưu thành công!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PathwayPage() {
  const user = useAuthStore(s => s.user);
  const [progress, setProgress] = useState<any>(null);
  const [pathway, setPathway] = useState<PracticePathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathwaysList, setPathwaysList] = useState<PracticePathway[]>([]);
  
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  
  const [recordingExercise, setRecordingExercise] = useState<DayExercise | null>(null);
  const [checkedInDays, setCheckedInDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Attempt to load progress
      try {
        const prog = await practiceApi.getProgress();
        setProgress(prog);
        setPathway(prog.pathway);
        setSelectedWeek(prog.currentWeek);
      } catch (err: any) {
        // If 404, load pathways list to let user start one
        if (err.status === 404 || err.message?.includes('Chưa có')) {
          const res = await practiceApi.getPathways();
          setPathwaysList(res.pathways);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPathway = async (id: string) => {
    try {
      await practiceApi.startPathway(id);
      toast.success('Thành công', 'Đã bắt đầu lộ trình luyện tập');
      loadData();
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể bắt đầu lộ trình');
    }
  };

  const handleExpandDay = async (week: number, day: number) => {
    if (expandedDay === day) {
      setExpandedDay(null);
      return;
    }
    
    setExpandedDay(day);
    setLoadingDay(true);
    try {
      const data = await practiceApi.getDayExercises(week, day);
      setDayContent(data);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tải bài tập');
      setExpandedDay(null);
    } finally {
      setLoadingDay(false);
    }
  };

  const handleCheckIn = async (week: number, day: number, exercisesCount: number) => {
    try {
      const res = await practiceApi.checkin(week, day, exercisesCount);
      setCheckedInDays(prev => new Set(prev).add(day));
      toast.success('Chấm công thành công!', `Chuỗi hiện tại: ${res.newStreak} ngày 🎉`);
      if (res.milestoneAchieved) {
        toast.success('Thành tựu!', res.milestoneAchieved.message);
      }
      loadData(); // Reload progress
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Chấm công thất bại');
    }
  };

  if (loading) return <div className="p-xl text-center">Đang tải dữ liệu...</div>;

  if (!progress || !pathway) {
    return (
      <div style={{ padding: 'var(--md-sys-space-2xl)', maxWidth: 800, margin: '0 auto' }}>
        <h1 className="page-title mb-xl">Chọn Lộ Trình Luyện Tập</h1>
        {pathwaysList.length === 0 ? (
          <p>Không có lộ trình nào khả dụng.</p>
        ) : (
          <div className="flex flex-col gap-md">
            {pathwaysList.map(p => (
              <div key={p._id} className="card-positivus">
                <h3 className="font-semibold mb-sm">{p.name}</h3>
                <p className="text-secondary mb-md">{p.description}</p>
                <div className="flex gap-sm mb-md">
                  <span className="badge badge-primary">{p.durationDays} ngày</span>
                  <span className="badge badge-warning">Mức độ: {p.level}</span>
                </div>
                <button className="btn btn-lime" onClick={() => handleStartPathway(p._id)}>
                  Bắt đầu lộ trình
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const completedDays = progress.completedSessions || 0;
  const totalDays = pathway.durationDays || 35;
  const progressPercent = progress.completionPercentage || 0;

  // Render dummy days for UI (1 to 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div style={{ padding: 'var(--md-sys-space-2xl)', maxWidth: 800, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--md-sys-space-2xl)' }}>
        <h1 style={{
          fontSize: 'var(--md-sys-typescale-headline-medium-size)',
          fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--md-sys-space-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--md-sys-space-md)',
        }}>
          <Route size={28} color="var(--md-sys-color-primary)" />
          <span style={{ color: 'var(--md-sys-color-primary)' }}>{pathway.name}</span>
        </h1>
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-large-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          {pathway.description}
        </p>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'var(--md-sys-color-surface-container-lowest)',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--md-sys-space-xl)',
        marginBottom: 'var(--md-sys-space-xl)',
        boxShadow: 'var(--md-sys-elevation-1)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--md-sys-space-md)',
        }}>
          <span style={{
            fontSize: 'var(--md-sys-typescale-title-medium-size)',
            fontWeight: 500,
            color: 'var(--md-sys-color-on-surface)',
          }}>
            Tiến độ lộ trình
          </span>
          <span style={{
            padding: '6px 16px',
            background: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            fontSize: 'var(--md-sys-typescale-label-large-size)',
            fontWeight: 500,
          }}>
            {progressPercent}% hoàn thành
          </span>
        </div>
        <div style={{
          height: 8,
          background: 'var(--md-sys-color-surface-container-high)',
          borderRadius: 'var(--md-sys-shape-corner-full)',
          overflow: 'hidden',
          marginBottom: 'var(--md-sys-space-md)',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--md-sys-color-primary)',
            transition: 'width var(--md-motion-duration-medium2) var(--md-motion-easing-standard)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          <span>{completedDays} / {totalDays} ngày đã luyện tập</span>
          <span>Chuỗi: {progress.currentStreak} ngày 🔥</span>
        </div>
      </div>

      {/* Week Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--md-sys-space-md)',
        marginBottom: 'var(--md-sys-space-xl)',
        overflowX: 'auto',
        paddingBottom: 4,
      }}>
        {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => {
          const w = i + 1;
          const isLocked = w > progress.currentWeek;
          return (
            <button
              key={w}
              onClick={() => !isLocked && setSelectedWeek(w)}
              style={{
                padding: '10px 24px',
                background: selectedWeek === w ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)',
                color: selectedWeek === w ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 500,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.5 : 1,
                whiteSpace: 'nowrap',
                transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                boxShadow: selectedWeek === w ? 'var(--md-sys-elevation-1)' : 'none',
              }}
            >
              Tuần {w} {isLocked ? '🔒' : ''}
            </button>
          );
        })}
      </div>

      {/* Daily Exercises */}
      <div className="flex flex-col gap-sm">
        {weekDays.map((day) => {
          const isExpanded = expandedDay === day;
          // Determine if done (if past week/day, it's done. Or if checked in.)
          const isDone = (selectedWeek < progress.currentWeek) || 
                         (selectedWeek === progress.currentWeek && day < progress.currentDay) ||
                         checkedInDays.has(day);

          const isLocked = (selectedWeek === progress.currentWeek && day > progress.currentDay);

          return (
            <div key={day} className="card-positivus" style={{
              borderLeft: `4px solid ${isLocked ? 'var(--md-sys-color-outline)' : isDone ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'}`,
              opacity: isLocked ? 0.6 : 1,
              boxShadow: isDone ? '0 5px 0 0 var(--md-sys-color-primary)' : undefined,
            }}>
              <div
                className="flex items-center justify-between"
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                onClick={() => !isLocked && handleExpandDay(selectedWeek, day)}
              >
                <div className="flex items-center gap-md">
                  {isDone ? (
                    <CheckCircle size={20} color="var(--md-sys-color-primary)" />
                  ) : isLocked ? (
                    <Pause size={20} color="var(--md-sys-color-on-surface-muted)" />
                  ) : (
                    <Play size={20} />
                  )}
                  <div>
                    <span className="font-semibold">Ngày {day}</span>
                    {isDone && <span className="badge badge-success" style={{ marginLeft: 8 }}>Hoàn thành</span>}
                  </div>
                </div>
                {!isLocked && (
                  <div className="flex items-center gap-sm">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div style={{ marginTop: 'var(--md-sys-space-lg)' }}>
                  {loadingDay ? (
                    <div className="text-center p-md">Đang tải...</div>
                  ) : dayContent ? (
                    dayContent.isRestDay ? (
                      <div className="text-center p-md text-secondary">Hôm nay là ngày nghỉ! Hãy thư giãn.</div>
                    ) : (
                      <>
                        {dayContent.videoTutorial && (
                          <div style={{ background: 'var(--md-sys-color-surface-container-high)', borderRadius: 'var(--md-sys-shape-corner-extra-large)', overflow: 'hidden', marginBottom: 'var(--md-sys-space-lg)' }}>
                            <div style={{ background: '#000', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Play fill="white" color="white" size={24} style={{ marginLeft: 4 }} />
                              </div>
                              <span style={{ position: 'absolute', bottom: 8, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>Mô phỏng Video</span>
                            </div>
                            <div style={{ padding: 'var(--md-sys-space-md)' }}>
                              <div className="font-semibold" style={{ fontSize: 'var(--md-sys-typescale-title-medium-size)', color: 'var(--md-sys-color-on-surface)' }}>{dayContent.videoTutorial.title}</div>
                              <div className="text-secondary" style={{ fontSize: 'var(--md-sys-typescale-body-medium-size)', marginTop: 4 }}>{dayContent.videoTutorial.description}</div>
                            </div>
                          </div>
                        )}
                        {dayContent.exercises.map(ex => (
                          <DayExerciseCard key={ex.exerciseId} exercise={ex} onRecord={() => setRecordingExercise(ex)} />
                        ))}
                        {!isDone && (
                          <button className="btn btn-success w-full mt-md" style={{ padding: '16px', fontSize: 'var(--md-sys-typescale-title-small-size)' }} onClick={() => handleCheckIn(selectedWeek, day, dayContent.exercises.length)}>
                            <CheckCircle size={20} /> Chấm công — Đánh dấu hoàn thành Ngày {day}
                          </button>
                        )}
                      </>
                    )
                  ) : (
                    <div className="text-center p-md">Không tải được dữ liệu.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recordingExercise && (
        <RecordingModal 
          exercise={recordingExercise} 
          week={selectedWeek}
          day={expandedDay!}
          onClose={() => setRecordingExercise(null)} 
        />
      )}
    </div>
  );
}
