import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Flame,
  Mic2,
  Play,
  Sparkles,
  Users,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { useAuthStore } from '../store/authStore';
import '../styles/dashboard-page.css';

const formatToday = () => new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
}).format(new Date());

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchValue, setSearchValue] = useState('');
  const firstName = user?.fullName?.trim().split(/\s+/).pop() || 'bạn';

  return (
    <main className="gv-page gv-dashboard">
      <div className="gv-page__inner">
        <PageHeader
          eyebrow={formatToday()}
          title={`Chào ${firstName}!`}
          description="Sẵn sàng cho một buổi luyện tập nhẹ nhàng và hiệu quả hôm nay."
          showSearch
          searchValue={searchValue}
          searchPlaceholder="Tìm bài luyện tập..."
          onSearchChange={setSearchValue}
        />

        <section className="gv-dashboard__hero" aria-labelledby="dashboard-hero-title">
          <img src="/images/home-temple-hero.png" alt="Không gian kiến trúc Việt Nam" />
          <div className="gv-dashboard__hero-overlay" />
          <div className="gv-dashboard__hero-copy">
            <span><Sparkles size={15} /> Gợi ý dành cho bạn</span>
            <h2 id="dashboard-hero-title">Giọng nói tự tin bắt đầu từ vài phút luyện tập mỗi ngày.</h2>
            <p>Tiếp tục lộ trình cá nhân hóa và nhận phản hồi ngay sau từng bài luyện.</p>
            <div>
              <button className="gv-primary-button" type="button" onClick={() => navigate('/pathway')}>
                Tiếp tục luyện tập <ArrowRight size={17} />
              </button>
              <button className="gv-dashboard__hero-link" type="button" onClick={() => navigate('/assessment')}>
                Xem đánh giá
              </button>
            </div>
          </div>
        </section>

        <section className="gv-dashboard__metrics" aria-label="Tổng quan hôm nay">
          <article className="gv-dashboard__metric gv-dashboard__metric--primary">
            <div className="gv-dashboard__metric-heading">
              <span>Chuỗi ngày học</span>
              <span className="gv-dashboard__metric-icon"><Flame size={20} /></span>
            </div>
            <strong>{user?.currentStreak || 0}<small> ngày</small></strong>
            <p>Duy trì nhịp học để tiến bộ đều đặn.</p>
          </article>

          <article className="gv-dashboard__metric">
            <div className="gv-dashboard__metric-heading">
              <span>Mục tiêu tuần</span>
              <span className="gv-dashboard__metric-icon gv-dashboard__metric-icon--soft"><CheckCircle2 size={20} /></span>
            </div>
            <div className="gv-dashboard__progress-row">
              <div className="gv-dashboard__ring" aria-label="Hoàn thành 75 phần trăm">
                <span>75%</span>
              </div>
              <p>Còn 1 bài để hoàn thành mục tiêu tuần.</p>
            </div>
          </article>

          <article className="gv-dashboard__metric">
            <div className="gv-dashboard__metric-heading">
              <span>Thời gian luyện tập</span>
              <span className="gv-dashboard__metric-icon gv-dashboard__metric-icon--tertiary"><Mic2 size={20} /></span>
            </div>
            <strong className="gv-dashboard__metric-value">{Math.max(12, Math.round((user?.totalPracticeTime || 0) / 60))}<small> phút</small></strong>
            <div className="gv-dashboard__bars" aria-hidden="true">
              {[38, 58, 46, 82, 67, 42, 54].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
          </article>
        </section>

        <section className="gv-dashboard__section" aria-labelledby="dashboard-spaces-title">
          <div className="gv-dashboard__section-heading">
            <div>
              <h2 id="dashboard-spaces-title">Không gian luyện tập</h2>
              <p>Chọn hoạt động phù hợp với mục tiêu của bạn.</p>
            </div>
            <button type="button" onClick={() => navigate('/pathway')}>Xem lộ trình <ArrowRight size={16} /></button>
          </div>

          <div className="gv-dashboard__activity-grid">
            <button className="gv-dashboard__activity gv-dashboard__activity--assessment" type="button" onClick={() => navigate('/assessment')}>
              <span className="gv-dashboard__activity-icon"><Mic2 size={23} /></span>
              <span className="gv-chip">Đánh giá AI</span>
              <strong>Hiểu rõ giọng nói của bạn</strong>
              <small>Phân tích phát âm, nhịp điệu và độ rõ để xây dựng lộ trình phù hợp.</small>
              <span className="gv-dashboard__activity-link">Bắt đầu đánh giá <ArrowRight size={15} /></span>
            </button>

            <button className="gv-dashboard__activity gv-dashboard__activity--pathway" type="button" onClick={() => navigate('/pathway')}>
              <span className="gv-dashboard__activity-icon"><Play size={23} /></span>
              <span className="gv-chip">Luyện tập</span>
              <strong>Lộ trình cá nhân hóa</strong>
              <small>Bài học ngắn, phản hồi tức thì và mục tiêu rõ ràng cho từng tuần.</small>
              <span className="gv-dashboard__activity-link">Tiếp tục bài học <ArrowRight size={15} /></span>
            </button>

            <button className="gv-dashboard__activity gv-dashboard__activity--compact" type="button" onClick={() => navigate('/chat')}>
              <span className="gv-dashboard__activity-icon gv-dashboard__activity-icon--tertiary"><Bot size={22} /></span>
              <strong>Trò chuyện cùng Chị Gà</strong>
              <small>Hỏi đáp, lên kế hoạch và nhận lời động viên bất cứ lúc nào.</small>
              <span className="gv-dashboard__activity-link">Nhắn tin ngay <ArrowRight size={15} /></span>
            </button>

            <button className="gv-dashboard__activity gv-dashboard__activity--compact" type="button" onClick={() => navigate('/experts')}>
              <span className="gv-dashboard__activity-icon gv-dashboard__activity-icon--neutral"><Users size={22} /></span>
              <strong>Kết nối chuyên gia</strong>
              <small>Tìm người đồng hành phù hợp và gửi yêu cầu tư vấn 1:1.</small>
              <span className="gv-dashboard__activity-link">Tìm chuyên gia <ArrowRight size={15} /></span>
            </button>
          </div>
        </section>

        {searchValue && (
          <p className="gv-dashboard__search-status" role="status">
            Đang tìm “{searchValue}” trong các bài luyện tập
          </p>
        )}
      </div>
    </main>
  );
}
