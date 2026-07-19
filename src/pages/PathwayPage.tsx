import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
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
import '../styles/pathway-page.css';

type Exercise = {
  id: 'reading' | 'listening' | 'speaking';
  icon: 'book' | 'headphones' | 'mic';
  status: 'Chưa làm' | 'Đang làm';
  title: string;
  description: string;
  progress: number;
};

const EXERCISES: Exercise[] = [
  {
    id: 'reading',
    icon: 'book',
    status: 'Chưa làm',
    title: 'Đọc hiểu: Văn hóa Trà',
    description: 'Tìm hiểu về nghệ thuật thưởng trà truyền thống của người Việt qua góc nhìn hiện đại.',
    progress: 0,
  },
  {
    id: 'listening',
    icon: 'headphones',
    status: 'Đang làm',
    title: 'Nghe: Podcast Lịch sử',
    description: 'Lắng nghe câu chuyện về triều đại nhà Trần và những chiến công hiển hách.',
    progress: 45,
  },
  {
    id: 'speaking',
    icon: 'mic',
    status: 'Chưa làm',
    title: 'Nói: Giao tiếp hàng ngày',
    description: 'Luyện tập phát âm và ngữ điệu qua các tình huống giao tiếp tại chợ truyền thống.',
    progress: 0,
  },
];

const COMPLETED_DAYS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function ExerciseIcon({ type }: { type: Exercise['icon'] }) {
  if (type === 'headphones') return <Headphones size={22} />;
  if (type === 'mic') return <Mic size={22} />;
  return <BookOpen size={22} />;
}

export function PathwayPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2024, 9, 1));
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
    if (!selectedExercise) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedExercise(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedExercise]);

  const isReferenceMonth = currentMonth.getFullYear() === 2024 && currentMonth.getMonth() === 9;

  return (
    <main className="gv-pathway flex-1 ml-nav-rail-width min-h-screen">
      <div className="gv-pathway__content">
        <header className="gv-pathway__header">
          <div>
            <p>Thứ Năm, 24 Tháng 10</p>
            <h1>Tiến độ hôm nay</h1>
          </div>
          <button type="button" className="gv-pathway__avatar" onClick={() => navigate('/profile')} aria-label="Mở hồ sơ">
            <img src="/images/pathway-avatar.png" alt="Ảnh đại diện người dùng" />
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
            <strong>14 <small>Ngày</small></strong>
            <p>Tuyệt vời! Tiếp tục duy trì nhé.</p>
          </article>

          <article className="gv-pathway__goal">
            <div className="gv-pathway__metric-heading">
              <span>Mục tiêu hôm nay</span>
              <Target size={22} />
            </div>
            <div className="gv-pathway__goal-body">
              <div className="gv-pathway__ring" aria-label="Đã hoàn thành 75 phần trăm">
                <svg viewBox="0 0 74 74" aria-hidden="true">
                  <circle cx="37" cy="37" r="29" />
                  <circle className="gv-pathway__ring-progress" cx="37" cy="37" r="29" />
                </svg>
                <strong>75%</strong>
              </div>
              <p>Còn lại 15 phút để hoàn thành mục tiêu.</p>
            </div>
          </article>

          <article className="gv-pathway__week">
            <div className="gv-pathway__metric-heading">
              <span>Tiến độ tuần</span>
              <span className="gv-pathway__week-pill">4/7 Ngày</span>
            </div>
            <div className="gv-pathway__bars" aria-label="Bốn trên bảy ngày đã hoàn thành">
              {[34, 48, 72, 56, 28].map((height, index) => (
                <span
                  key={height}
                  className={index === 2 ? 'is-current' : index === 3 ? 'is-complete' : ''}
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </article>
        </section>

        <section className="gv-pathway__exercises" aria-labelledby="today-exercises-title">
          <div className="gv-pathway__section-heading">
            <h2 id="today-exercises-title">Bài tập hôm nay</h2>
            <button type="button" onClick={() => setSelectedExercise(EXERCISES[0])}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="gv-pathway__exercise-grid">
            {EXERCISES.map(exercise => (
              <button
                key={exercise.id}
                className="gv-pathway__exercise-card"
                type="button"
                onClick={() => setSelectedExercise(exercise)}
              >
                <span className={`gv-pathway__exercise-icon gv-pathway__exercise-icon--${exercise.id}`}>
                  <ExerciseIcon type={exercise.icon} />
                </span>
                <span className={`gv-pathway__status ${exercise.status === 'Đang làm' ? 'is-active' : ''}`}>
                  {exercise.status}
                </span>
                <strong>{exercise.title}</strong>
                <p>{exercise.description}</p>
                <span className="gv-pathway__progress" aria-label={`${exercise.progress}% hoàn thành`}>
                  <span style={{ width: `${exercise.progress}%` }} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="gv-pathway__bottom-grid">
          <article className="gv-pathway__recommendations">
            <h2><Sparkles size={25} /> Gợi ý cho bạn</h2>
            <p>Dựa trên kết quả bài kiểm tra gần nhất, chúng tôi đề xuất các chủ đề này để cải thiện kỹ năng của bạn.</p>

            <button type="button" onClick={() => setSelectedExercise(EXERCISES[0])}>
              <span className="gv-pathway__recommendation-icon"><Languages size={24} /></span>
              <span><strong>Ngữ pháp cơ bản</strong><small>Củng cố cấu trúc câu</small></span>
              <span className="gv-pathway__play"><Play size={15} fill="currentColor" /></span>
            </button>
            <button type="button" onClick={() => setSelectedExercise(EXERCISES[1])}>
              <span className="gv-pathway__recommendation-icon gv-pathway__recommendation-icon--secondary"><MessageSquareText size={22} /></span>
              <span><strong>Mở rộng từ vựng</strong><small>Chủ đề: Ẩm thực đường phố</small></span>
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
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day}>{day}</span>)}
            </div>
            <div className="gv-pathway__calendar-days">
              {calendarDays.map((day, index) => {
                const isToday = isReferenceMonth && day === 24;
                const isCompleted = isReferenceMonth && day !== null && COMPLETED_DAYS.includes(day);
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

      {selectedExercise && (
        <div className="gv-pathway__modal-backdrop" role="presentation" onMouseDown={() => setSelectedExercise(null)}>
          <section
            className="gv-pathway__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pathway-lesson-title"
            onMouseDown={event => event.stopPropagation()}
          >
            <button className="gv-pathway__modal-close" type="button" aria-label="Đóng" onClick={() => setSelectedExercise(null)}>
              <X size={20} />
            </button>
            <span className={`gv-pathway__exercise-icon gv-pathway__exercise-icon--${selectedExercise.id}`}>
              <ExerciseIcon type={selectedExercise.icon} />
            </span>
            <span className="gv-pathway__modal-kicker">Bài luyện tập hôm nay</span>
            <h2 id="pathway-lesson-title">{selectedExercise.title}</h2>
            <p>{selectedExercise.description}</p>
            <div className="gv-pathway__modal-meta">
              <span>Khoảng 10 phút</span>
              <span>{selectedExercise.progress}% hoàn thành</span>
            </div>
            <button
              className="gv-pathway__modal-action"
              type="button"
              onClick={() => selectedExercise.id === 'speaking' ? navigate('/assessment') : setSelectedExercise(null)}
            >
              <Play size={17} fill="currentColor" /> {selectedExercise.progress > 0 ? 'Tiếp tục bài học' : 'Bắt đầu bài học'}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
