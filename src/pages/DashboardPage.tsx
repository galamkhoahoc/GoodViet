import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Mic2,
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
          <img
            src="https://images.pexels.com/photos/4476163/pexels-photo-4476163.jpeg?auto=compress&cs=tinysrgb&w=1800"
            alt="Người dùng luyện giọng với tai nghe và micro tại nhà"
            fetchPriority="high"
          />
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

        <section className="gv-dashboard__today" aria-labelledby="dashboard-today-title">
          <article className="gv-dashboard__today-plan gv-card">
            <div className="gv-dashboard__today-heading">
              <div>
                <span className="gv-chip">Khoảng 15 phút</span>
                <h2 id="dashboard-today-title">Kế hoạch nhỏ hôm nay</h2>
                <p>Ba việc ngắn để duy trì cảm giác nói tự nhiên.</p>
              </div>
              <button className="gv-secondary-button" type="button" onClick={() => navigate('/pathway')}>
                Vào bài luyện <ArrowRight size={16} />
              </button>
            </div>

            <div className="gv-dashboard__routine">
              <button type="button" onClick={() => navigate('/pathway')}>
                <span className="gv-dashboard__routine-number">01</span>
                <span><strong>Khởi động giọng nói</strong><small>Đọc chậm 3 câu trong bài tiếp theo</small></span>
                <ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => navigate('/pathway')}>
                <span className="gv-dashboard__routine-number gv-dashboard__routine-number--tertiary">02</span>
                <span><strong>Luyện trọng tâm</strong><small>10 phút với nhóm âm đang cải thiện</small></span>
                <ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => navigate('/chat')}>
                <span className="gv-dashboard__routine-number gv-dashboard__routine-number--neutral">03</span>
                <span><strong>Nhận một lời góp ý</strong><small>Trao đổi nhanh với Chị Gà sau khi luyện</small></span>
                <ArrowRight size={17} />
              </button>
            </div>
          </article>

          <aside className="gv-dashboard__reminder">
            <span className="gv-dashboard__reminder-icon"><CalendarClock size={24} /></span>
            <p>Nhắc bạn</p>
            <h2>Một khung giờ cố định giúp việc luyện tập dễ duy trì hơn.</h2>
            <button type="button" onClick={() => navigate('/settings')}>Thiết lập nhắc lịch <ArrowRight size={15} /></button>
          </aside>
        </section>

        <section className="gv-dashboard__section" aria-labelledby="dashboard-spaces-title">
          <div className="gv-dashboard__section-heading">
            <div>
              <h2 id="dashboard-spaces-title">Không gian luyện tập</h2>
              <p>Chọn hoạt động phù hợp với mục tiêu của bạn.</p>
            </div>
          </div>

          <div className="gv-dashboard__activity-grid">
            <button className="gv-dashboard__activity gv-dashboard__activity--assessment" type="button" onClick={() => navigate('/assessment')}>
              <span className="gv-dashboard__activity-icon"><Mic2 size={23} /></span>
              <span className="gv-chip">Đánh giá AI</span>
              <strong>Hiểu rõ giọng nói của bạn</strong>
              <small>Phân tích phát âm, nhịp điệu và độ rõ để xây dựng lộ trình phù hợp.</small>
              <span className="gv-dashboard__activity-link">Bắt đầu đánh giá <ArrowRight size={15} /></span>
            </button>

            <button className="gv-dashboard__activity gv-dashboard__activity--compact" type="button" onClick={() => navigate('/chat')}>
              <span className="gv-dashboard__activity-icon gv-dashboard__activity-icon--tertiary"><Bot size={22} /></span>
              <span className="gv-chip">Trợ lý AI</span>
              <strong>Trò chuyện cùng Chị Gà</strong>
              <small>Hỏi đáp, lên kế hoạch và nhận lời động viên bất cứ lúc nào.</small>
              <span className="gv-dashboard__activity-link">Nhắn tin ngay <ArrowRight size={15} /></span>
            </button>

            <button className="gv-dashboard__activity gv-dashboard__activity--compact" type="button" onClick={() => navigate('/experts')}>
              <span className="gv-dashboard__activity-icon gv-dashboard__activity-icon--neutral"><Users size={22} /></span>
              <span className="gv-chip">Tư vấn 1:1</span>
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
