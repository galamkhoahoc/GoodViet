import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  Languages,
  MessageSquareText,
  Mic,
  Play,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import {
  practiceLessons,
  practiceSummary,
  type PracticeLesson,
} from '../data/mockPractice';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { SentenceEvaluationPanel } from '../components/audio/SentenceEvaluationPanel';
import { useLocalSentenceEvaluation } from '../hooks/useLocalSentenceEvaluation';
import type { SentenceEvaluationResult } from '../services/ml/sentenceEvaluation';
import { useAuthStore } from '../store/authStore';
import { practiceApi } from '../services/api/practiceApi';
import '../styles/pathway-page.css';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

const getVietnamDateParts = (date = new Date()): CalendarDateParts => {
  const values = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const toCalendarDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const toVietnamDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const parts = getVietnamDateParts(date);
  return toCalendarDateKey(parts.year, parts.month, parts.day);
};

const formatVietnamToday = (date: Date) => {
  const label = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

type LessonMode = 'short' | 'long';
type LessonIcon = 'book' | 'headphones' | 'mic';

const getLessonIcon = (lesson: PracticeLesson): LessonIcon => {
  if (lesson.order % 3 === 2) return 'headphones';
  if (lesson.order % 3 === 0) return 'mic';
  return 'book';
};

const getStatusLabel = (
  lesson: PracticeLesson,
  startedLessons: Set<string>,
  ignoreSavedProgress = false,
) => {
  if (!ignoreSavedProgress && lesson.status === 'completed') return 'Hoàn thành';
  if ((!ignoreSavedProgress && lesson.status === 'in_progress') || startedLessons.has(lesson.id)) return 'Đang làm';
  return 'Chưa làm';
};

function LessonIconView({ type }: { type: LessonIcon }) {
  if (type === 'headphones') return <Headphones size={22} />;
  if (type === 'mic') return <Mic size={22} />;
  return <BookOpen size={22} />;
}

export function PathwayPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isTemporaryAccount = user?.accountType === 'temporary';
  const [now, setNow] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = getVietnamDateParts();
    return new Date(today.year, today.month - 1, 1);
  });
  const [completedDateKeys, setCompletedDateKeys] = useState<Set<string>>(() => new Set());
  const [selectedLesson, setSelectedLesson] = useState<PracticeLesson | null>(null);
  const [lessonMode, setLessonMode] = useState<LessonMode>('short');
  const [startedLessons, setStartedLessons] = useState<Set<string>>(() => new Set());
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResults, setPracticeResults] = useState<Map<number, SentenceEvaluationResult>>(new Map());
  const practiceEvaluation = useLocalSentenceEvaluation();
  const resetPracticeEvaluation = practiceEvaluation.reset;
  const today = useMemo(() => getVietnamDateParts(now), [now]);
  const todayDateKey = toCalendarDateKey(today.year, today.month, today.day);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const mondayBasedFirstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = Array.from({ length: mondayBasedFirstDay }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isTemporaryAccount) return undefined;
    let isActive = true;

    void practiceApi.getHistory()
      .then(({ history }) => {
        if (!isActive) return;
        setCompletedDateKeys(new Set(history.map((entry) => toVietnamDateKey(entry.completedAt))));
      })
      .catch((error) => {
        console.error('Unable to load practice history for the calendar', error);
      });

    return () => {
      isActive = false;
    };
  }, [isTemporaryAccount]);

  useEffect(() => {
    if (!selectedLesson) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetPracticeEvaluation();
        setSelectedLesson(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [resetPracticeEvaluation, selectedLesson]);

  const openLesson = (lesson: PracticeLesson) => {
    setLessonMode('short');
    setIsPracticeActive(false);
    setPracticeIndex(0);
    setPracticeResults(new Map());
    practiceEvaluation.reset();
    setSelectedLesson(lesson);
  };

  const startLesson = () => {
    if (!selectedLesson) return;
    setStartedLessons((current) => new Set(current).add(selectedLesson.id));
    setPracticeIndex(0);
    setPracticeResults(new Map());
    practiceEvaluation.reset();
    setIsPracticeActive(true);
  };

  const closeLesson = () => {
    practiceEvaluation.reset();
    setIsPracticeActive(false);
    setSelectedLesson(null);
  };

  const practiceTexts = selectedLesson
    ? lessonMode === 'short' ? selectedLesson.shortSentences : selectedLesson.longPassages
    : [];

  const handlePracticeRecording = async (blob: Blob) => {
    const sentenceIndex = practiceIndex;
    const target = practiceTexts[sentenceIndex];
    if (!target) return;
    try {
      const result = await practiceEvaluation.analyze(blob, target);
      setPracticeResults(previous => new Map(previous).set(sentenceIndex, result));
    } catch (error) {
      console.error('Practice sentence evaluation failed', error);
    }
  };

  const continuePractice = () => {
    if (practiceIndex < practiceTexts.length - 1) {
      practiceEvaluation.reset();
      setPracticeIndex(index => index + 1);
      return;
    }
    closeLesson();
  };

  const recommendedLessons = [practiceLessons[3], practiceLessons[7]];
  const displaySummary = isTemporaryAccount
    ? { ...practiceSummary, currentStreak: 0, longestStreak: 0, completedLessons: 0, weeklyCompleted: 0 }
    : practiceSummary;
  const goalPercentage = Math.round(
    (displaySummary.weeklyCompleted / displaySummary.weeklyGoal) * 100
  );
  const weeklyBars = isTemporaryAccount ? [18, 18, 18, 18, 18] : [34, 48, 72, 56, 28];

  return (
    <main className="gv-pathway flex-1 ml-nav-rail-width min-h-screen">
      <div className="gv-pathway__content">
        <header className="gv-pathway__header">
          <div>
            <p>{formatVietnamToday(now)}</p>
            <h1>Tiến độ hôm nay</h1>
          </div>
          <button type="button" className="gv-pathway__avatar" onClick={() => navigate('/profile')} aria-label="Mở hồ sơ">
            <span>{user?.fullName?.trim().charAt(0).toUpperCase() || 'G'}</span>
          </button>
        </header>

        <section className="gv-pathway__quote" aria-label="Trích dẫn trong ngày">
          <img src="/images/pathway-quote-banner.png" alt="Bình hoa và bộ trà trong không gian Việt" />
          <div className="gv-pathway__quote-overlay" />
          <div className="gv-pathway__quote-copy">
            <span>TRÍCH DẪN TRONG NGÀY</span>
            <blockquote>“Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.”</blockquote>
          </div>
        </section>

        <section className="gv-pathway__metrics" aria-label="Tổng quan tiến độ">
          <article className="gv-pathway__streak">
            <div className="gv-pathway__metric-heading">
              <span>Chuỗi ngày học</span>
              <span className="gv-pathway__round-icon"><Flame size={20} /></span>
            </div>
            <strong>{displaySummary.currentStreak} <small>Ngày</small></strong>
            <p>{isTemporaryAccount ? 'Bắt đầu bài luyện đầu tiên của bạn nhé.' : 'Tuyệt vời! Tiếp tục duy trì nhé.'}</p>
          </article>

          <article className="gv-pathway__goal">
            <div className="gv-pathway__metric-heading">
              <span>Mục tiêu tuần</span>
              <Target size={22} />
            </div>
            <div className="gv-pathway__goal-body">
              <div className="gv-pathway__ring" aria-label={`Đã hoàn thành ${goalPercentage} phần trăm`}>
                <svg viewBox="0 0 74 74" aria-hidden="true">
                  <circle cx="37" cy="37" r="29" />
                  <circle className="gv-pathway__ring-progress" cx="37" cy="37" r="29" />
                </svg>
                <strong>{goalPercentage}%</strong>
              </div>
              <p>Còn {displaySummary.weeklyGoal - displaySummary.weeklyCompleted} bài để hoàn thành mục tiêu tuần.</p>
            </div>
          </article>

          <article className="gv-pathway__week">
            <div className="gv-pathway__metric-heading">
              <span>Tiến độ tuần</span>
              <span className="gv-pathway__week-pill">
                {displaySummary.weeklyCompleted}/{displaySummary.weeklyGoal} Bài
              </span>
            </div>
            <div className="gv-pathway__bars" aria-label={`${displaySummary.weeklyCompleted} trên ${displaySummary.weeklyGoal} bài đã hoàn thành`}>
              {weeklyBars.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className={!isTemporaryAccount && index === 2 ? 'is-current' : !isTemporaryAccount && index === 3 ? 'is-complete' : ''}
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </article>
        </section>

        <section className="gv-pathway__exercises" aria-labelledby="practice-library-title">
          <div className="gv-pathway__section-heading">
            <h2 id="practice-library-title">Kho bài luyện tập</h2>
            <span className="gv-pathway__lesson-count">{practiceLessons.length} chủ đề</span>
          </div>

          <div className="gv-pathway__exercise-grid">
            {practiceLessons.map((lesson) => {
              const icon = getLessonIcon(lesson);
              const status = getStatusLabel(lesson, startedLessons, isTemporaryAccount);
              const progress = isTemporaryAccount
                ? (startedLessons.has(lesson.id) ? 10 : 0)
                : lesson.progress || (startedLessons.has(lesson.id) ? 10 : 0);

              return (
                <button
                  key={lesson.id}
                  className="gv-pathway__exercise-card"
                  type="button"
                  onClick={() => openLesson(lesson)}
                >
                  <span className={`gv-pathway__exercise-icon gv-pathway__exercise-icon--${icon}`}>
                    <LessonIconView type={icon} />
                  </span>
                  <span className={`gv-pathway__status ${status !== 'Chưa làm' ? 'is-active' : ''}`}>
                    Bài {String(lesson.order).padStart(2, '0')} · {status}
                  </span>
                  <strong>{lesson.title}</strong>
                  <p>{lesson.goal}</p>
                  <span className="gv-pathway__progress" aria-label={`${progress}% hoàn thành`}>
                    <span style={{ width: `${progress}%` }} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="gv-pathway__bottom-grid">
          <article className="gv-pathway__recommendations">
            <h2><Sparkles size={25} /> Gợi ý cho bạn</h2>
            <p>Dựa trên kết quả bài kiểm tra gần nhất, chúng tôi đề xuất các chủ đề này để cải thiện kỹ năng của bạn.</p>

            <button type="button" onClick={() => openLesson(recommendedLessons[0])}>
              <span className="gv-pathway__recommendation-icon"><Languages size={24} /></span>
              <span><strong>{recommendedLessons[0].title}</strong><small>Luyện rõ âm TR/CH và S/X</small></span>
              <span className="gv-pathway__play"><Play size={15} fill="currentColor" /></span>
            </button>
            <button type="button" onClick={() => openLesson(recommendedLessons[1])}>
              <span className="gv-pathway__recommendation-icon gv-pathway__recommendation-icon--secondary"><MessageSquareText size={22} /></span>
              <span><strong>{recommendedLessons[1].title}</strong><small>Luyện sự tự tin và thông điệp rõ ràng</small></span>
              <span className="gv-pathway__play"><Play size={15} fill="currentColor" /></span>
            </button>
          </article>

          <article className="gv-pathway__calendar">
            <div className="gv-pathway__calendar-heading">
              <h2>Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}</h2>
              <div>
                <button
                  type="button"
                  aria-label="Tháng trước"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Tháng sau"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="gv-pathway__weekdays" aria-hidden="true">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="gv-pathway__calendar-days">
              {calendarDays.map((day, index) => {
                const dateKey = day === null
                  ? null
                  : toCalendarDateKey(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
                const isToday = dateKey === todayDateKey;
                const isCompleted = !isTemporaryAccount && dateKey !== null && completedDateKeys.has(dateKey);
                return (
                  <span
                    key={`${day ?? 'empty'}-${index}`}
                    className={`${isToday ? 'is-today' : ''} ${isCompleted ? 'is-completed' : ''}`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </article>
        </section>
      </div>

      {selectedLesson && (
        <div className="gv-pathway__modal-backdrop" role="presentation" onMouseDown={closeLesson}>
          <section
            className="gv-pathway__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pathway-lesson-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="gv-pathway__modal-close" type="button" aria-label="Đóng" onClick={closeLesson}>
              <X size={20} />
            </button>
            <span className={`gv-pathway__exercise-icon gv-pathway__exercise-icon--${getLessonIcon(selectedLesson)}`}>
              <LessonIconView type={getLessonIcon(selectedLesson)} />
            </span>
            <span className="gv-pathway__modal-kicker">
              Bài {String(selectedLesson.order).padStart(2, '0')} · {selectedLesson.level}
            </span>
            <h2 id="pathway-lesson-title">{selectedLesson.title}</h2>
            <p className="gv-pathway__modal-goal">{selectedLesson.goal}</p>

            {!isPracticeActive ? (
              <>
                <div className="gv-pathway__focus-list" aria-label="Trọng tâm bài học">
                  {selectedLesson.focus.map((focus) => <span key={focus}>{focus}</span>)}
                </div>

                <div className="gv-pathway__modal-meta">
                  <span>Khoảng {selectedLesson.estimatedMinutes} phút</span>
                  <span>{practiceTexts.length} nội dung luyện đọc</span>
                </div>

                <div className="gv-pathway__mode-tabs" role="tablist" aria-label="Chọn độ dài nội dung">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={lessonMode === 'short'}
                    className={lessonMode === 'short' ? 'is-selected' : ''}
                    onClick={() => setLessonMode('short')}
                  >
                    Câu ngắn
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={lessonMode === 'long'}
                    className={lessonMode === 'long' ? 'is-selected' : ''}
                    onClick={() => setLessonMode('long')}
                  >
                    Đoạn dài
                  </button>
                </div>

                <ol className="gv-pathway__practice-list">
                  {practiceTexts.map((text, index) => (
                    <li key={text}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p>{text}</p>
                    </li>
                  ))}
                </ol>

                <button className="gv-pathway__modal-action" type="button" onClick={startLesson}>
                  <Play size={17} fill="currentColor" />
                  {getStatusLabel(selectedLesson, startedLessons, isTemporaryAccount) === 'Chưa làm' ? 'Bắt đầu luyện tập' : 'Tiếp tục luyện tập'}
                </button>
              </>
            ) : (
              <div className="gv-pathway__practice-runner">
                <div className="gv-pathway__practice-progress">
                  <span>Câu {practiceIndex + 1}/{practiceTexts.length}</span>
                  <div><span style={{ width: `${((practiceIndex + (practiceResults.has(practiceIndex) ? 1 : 0)) / Math.max(1, practiceTexts.length)) * 100}%` }} /></div>
                </div>

                <blockquote>{practiceTexts[practiceIndex]}</blockquote>

                {practiceEvaluation.stage !== 'speech' && practiceEvaluation.stage !== 'feedback' && !practiceResults.has(practiceIndex) && (
                  <AudioRecorder
                    key={`${selectedLesson.id}-${lessonMode}-${practiceIndex}`}
                    compact
                    maxDuration={30}
                    minDuration={1}
                    showPlayback={false}
                    onRecordingComplete={(blob) => void handlePracticeRecording(blob)}
                  />
                )}

                <SentenceEvaluationPanel
                  stage={practiceResults.has(practiceIndex) ? 'complete' : practiceEvaluation.stage}
                  detail={practiceEvaluation.detail}
                  result={practiceResults.get(practiceIndex) || practiceEvaluation.result}
                  error={practiceEvaluation.error}
                />

                {practiceResults.has(practiceIndex) && (
                  <button className="gv-pathway__modal-action" type="button" onClick={continuePractice}>
                    {practiceIndex === practiceTexts.length - 1 ? <CheckCircle size={17} /> : <ChevronRight size={17} />}
                    {practiceIndex === practiceTexts.length - 1 ? 'Hoàn thành bài luyện' : 'Câu tiếp theo'}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
