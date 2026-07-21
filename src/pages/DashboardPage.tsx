import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Bot,
  Check,
  Globe2,
  Mail,
  MessageCircle,
  Mic2,
  Search,
  Share2,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import '../styles/dashboard-page.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [searchValue, setSearchValue] = useState('');

  return (
    <main className="gv-home flex-1 ml-nav-rail-width min-h-screen">
      <header className="gv-home__topbar">
        <div className="gv-home__topbar-inner">
          <h1>Home</h1>

          <div className="gv-home__topbar-actions">
            <label className="gv-home__search">
              <Search aria-hidden="true" size={16} />
              <input
                aria-label="Tìm kiếm"
                type="search"
                placeholder="Search..."
                value={searchValue}
                onChange={event => setSearchValue(event.target.value)}
              />
            </label>
            <button className="gv-home__icon-button" type="button" aria-label="Thông báo">
              <Bell size={20} />
            </button>
            <button className="gv-home__icon-button" type="button" aria-label="Ngôn ngữ">
              <Globe2 size={20} />
            </button>
            <button
              className="gv-home__avatar"
              type="button"
              aria-label="Mở hồ sơ"
              onClick={() => navigate('/profile')}
            >
              {user?.fullName?.trim().charAt(0).toUpperCase() || 'G'}
            </button>
          </div>
        </div>
      </header>

      <div className="gv-home__content">
        <section className="gv-home__hero" aria-labelledby="home-hero-title">
          <img src="/images/home-temple-hero.png" alt="Ngôi đền Việt Nam giữa khu vườn xanh" />
          <div className="gv-home__hero-shade" />
          <div className="gv-home__hero-content">
            <h2 id="home-hero-title">
              Luyện Phát Âm Tiếng Việt
              <span>Chuẩn Xác Với AI.</span>
            </h2>
            <p>
              Nâng tầm giọng nói, tự tin giao tiếp. GOODVIET giúp người trưởng thành
              khắc phục các lỗi phát âm (L/N, TR/CH, S/X) thông qua công nghệ phân
              tích giọng nói tiên tiến.
            </p>
            <div className="gv-home__hero-buttons">
              <button className="gv-home__button gv-home__button--primary" type="button" onClick={() => navigate('/assessment')}>
                Bắt đầu đánh giá ngay <ArrowRight size={17} />
              </button>
              <button className="gv-home__button gv-home__button--soft" type="button" onClick={() => navigate('/pathway')}>
                Tìm hiểu lộ trình
              </button>
            </div>
          </div>
        </section>

        <section className="gv-home__core" aria-labelledby="home-core-title">
          <div className="gv-home__section-heading">
            <div>
              <h2 id="home-core-title">Cốt Lõi Nền Tảng</h2>
              <p>Giải pháp toàn diện cho việc luyện phát âm.</p>
            </div>
            <button type="button" onClick={() => navigate('/pathway')}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="gv-home__bento">
            <button
              className="gv-home__feature gv-home__feature--assessment"
              type="button"
              onClick={() => navigate('/assessment')}
            >
              <div className="gv-home__feature-copy">
                <span className="gv-home__tag">Assessment</span>
                <h3>Đánh giá giọng nói AI</h3>
                <p>Hệ thống sàng lọc 3 giai đoạn giúp chẩn đoán chính xác các vấn đề phát âm.</p>
              </div>
            </button>

            <button
              className="gv-home__feature gv-home__feature--practice"
              type="button"
              onClick={() => navigate('/pathway')}
            >
              <div className="gv-home__feature-copy">
                <span className="gv-home__tag gv-home__tag--tertiary">Practice</span>
                <h3>Lộ trình cá nhân hóa</h3>
                <p>Các bài tập được thiết kế riêng biệt cho từng người dùng trong 1–1.5 tháng.</p>
              </div>
            </button>

            <button className="gv-home__mini-card" type="button" onClick={() => navigate('/chat')}>
              <span className="gv-home__mini-icon"><Bot size={22} /></span>
              <div>
                <h3>Trò chuyện cùng AI</h3>
                <p>Trợ lý Chị Gà luôn sẵn sàng hỗ trợ, động viên và giải đáp thắc mắc.</p>
                <span className="gv-home__text-link">Trò chuyện <ArrowRight size={14} /></span>
              </div>
            </button>

            <button className="gv-home__mini-card" type="button" onClick={() => navigate('/experts')}>
              <span className="gv-home__mini-icon gv-home__mini-icon--light"><Users size={22} /></span>
              <div>
                <h3>Kết nối chuyên gia</h3>
                <p>Đặt lịch tư vấn 1:1 trực tiếp với các chuyên gia ngôn ngữ trị liệu hàng đầu.</p>
                <span className="gv-home__text-link">Tìm hiểu thêm <ArrowRight size={14} /></span>
              </div>
            </button>
          </div>
        </section>

        <section className="gv-home__solution" aria-labelledby="home-solution-title">
          <div className="gv-home__solution-copy">
            <span className="gv-home__eyebrow"><Mic2 size={14} /> Hiệu Quả Cao Nhất</span>
            <h2 id="home-solution-title">Giải Pháp Toàn Diện Cho Giọng Nói</h2>
            <p>GOODVIET kết hợp giữa trí tuệ nhân tạo và chuyên môn lâm sàng để mang lại hiệu quả cao nhất.</p>
            <ul>
              <li><span><Check size={14} /></span>Công nghệ AI phân tích từng âm tiết (phoneme).</li>
              <li><span><Check size={14} /></span>Hỗ trợ luyện tập offline và đồng bộ tự động.</li>
              <li><span><Check size={14} /></span>Theo dõi tiến độ và streak hàng ngày.</li>
            </ul>
            <button className="gv-home__button gv-home__button--outline" type="button" onClick={() => navigate('/assessment')}>
              Bắt Đầu Ngay
            </button>
          </div>
          <div className="gv-home__solution-image">
            <img src="/images/home-artisan.png" alt="Nghệ nhân Việt Nam đan sản phẩm thủ công" />
          </div>
        </section>
      </div>

      <footer className="gv-home__footer">
        <div className="gv-home__footer-inner">
          <div className="gv-home__footer-brand">
            <h2>GoodViet</h2>
            <p>Nền tảng luyện phát âm Tiếng Việt chuẩn xác với sự hỗ trợ của AI.</p>
          </div>
          <div>
            <h3>Platform</h3>
            <button type="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button type="button" onClick={() => navigate('/assessment')}>Assessment</button>
            <button type="button" onClick={() => navigate('/experts')}>Experts</button>
          </div>
          <div>
            <h3>Hỗ Trợ</h3>
            <button type="button">Contact Support</button>
            <button type="button">Terms of Service</button>
            <button type="button">Privacy Policy</button>
          </div>
          <div className="gv-home__footer-meta">
            <div>
              <button type="button" aria-label="Gửi email"><Mail size={16} /></button>
              <button type="button" aria-label="Chia sẻ"><Share2 size={16} /></button>
            </div>
            <p>© 2024 GoodViet Speech Therapy Platform.<br />All rights reserved.</p>
          </div>
        </div>
      </footer>

      {searchValue && (
        <div className="gv-home__search-status" role="status">
          <MessageCircle size={15} /> Đang tìm “{searchValue}”
        </div>
      )}
    </main>
  );
}
