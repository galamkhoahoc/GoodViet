import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  ChevronDown,
  CloudCheck,
  Headphones,
  KeyRound,
  Languages,
  LogOut,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { toast } from '../components/common/Toast';
import { PageHeader } from '../components/layout/PageHeader';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/profile-settings.css';

interface SettingSwitchProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

function SettingSwitch({ checked, label, onChange }: SettingSwitchProps) {
  return (
    <button
      className={`ps-switch${checked ? ' ps-switch--on' : ''}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const {
    language,
    timezone,
    emailNotifications,
    pushNotifications,
    practiceReminders,
    feedbackSounds,
    updateSettings,
    reset,
  } = useSettingsStore();

  const restoreDefaults = () => {
    reset();
    toast.success('Đã khôi phục cài đặt', 'Các tùy chọn đã trở về trạng thái mặc định.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="ps-page ps-page--settings">
      <div className="ps-page__inner">
        <PageHeader
          eyebrow="Tùy chỉnh trải nghiệm"
          title="Cài đặt tài khoản"
          description="Quản lý ngôn ngữ, thông báo và bảo mật trong một không gian thống nhất."
        />

        <div className="ps-settings-layout">
          <section className="ps-card ps-settings-savebar" aria-label="Trạng thái lưu cài đặt">
            <span className="ps-icon-circle"><CloudCheck aria-hidden="true" /></span>
            <div>
              <h2>Tự động lưu trên thiết bị</h2>
              <p>Mọi thay đổi có hiệu lực ngay. Bạn có thể khôi phục các giá trị mặc định bất cứ lúc nào.</p>
            </div>
            <button type="button" onClick={restoreDefaults}><RotateCcw size={16} /> Khôi phục mặc định</button>
          </section>

          <section className="ps-content" aria-label="Các tùy chọn tài khoản">
            <div className="ps-settings-grid">
              <section className="ps-card ps-setting-card" aria-labelledby="language-region-title">
                <div className="ps-card__title-row ps-card__title-row--top">
                  <div className="ps-setting-card__heading">
                    <span className="ps-icon-circle"><Languages aria-hidden="true" /></span>
                    <div>
                      <p className="ps-card__kicker">Hiển thị</p>
                      <h2 id="language-region-title">Ngôn ngữ &amp; Khu vực</h2>
                    </div>
                  </div>
                </div>

                <div className="ps-control-group">
                  <label htmlFor="settings-language">Ngôn ngữ hiển thị</label>
                  <div className="ps-select-wrap">
                    <select
                      id="settings-language"
                      value={language}
                      onChange={(event) => updateSettings({ language: event.target.value as 'vi' | 'en' })}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                    <ChevronDown aria-hidden="true" />
                  </div>
                </div>

                <div className="ps-control-group">
                  <label htmlFor="settings-timezone">Múi giờ</label>
                  <div className="ps-select-wrap">
                    <select
                      id="settings-timezone"
                      value={timezone}
                      onChange={(event) => updateSettings({ timezone: event.target.value })}
                    >
                      <option value="Asia/Ho_Chi_Minh">Giờ Đông Dương (ICT)</option>
                      <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                      <option value="UTC">Giờ phối hợp quốc tế (UTC)</option>
                    </select>
                    <ChevronDown aria-hidden="true" />
                  </div>
                </div>
              </section>

              <section className="ps-card ps-setting-card" aria-labelledby="notifications-title">
                <div className="ps-card__title-row ps-card__title-row--top">
                  <div className="ps-setting-card__heading">
                    <span className="ps-icon-circle ps-icon-circle--tertiary"><Bell aria-hidden="true" /></span>
                    <div>
                      <p className="ps-card__kicker">Kết nối</p>
                      <h2 id="notifications-title">Thông báo</h2>
                    </div>
                  </div>
                </div>

                <div className="ps-toggle-row">
                  <div>
                    <strong>Email tổng hợp</strong>
                    <span>Mẹo luyện tập và tiến độ hằng tuần</span>
                  </div>
                  <SettingSwitch
                    checked={emailNotifications}
                    label="Nhận email tổng hợp"
                    onChange={() => updateSettings({ emailNotifications: !emailNotifications })}
                  />
                </div>

                <div className="ps-toggle-row">
                  <div>
                    <strong>Thông báo đẩy</strong>
                    <span>Tin nhắn, phản hồi và lịch luyện tập</span>
                  </div>
                  <SettingSwitch
                    checked={pushNotifications}
                    label="Nhận thông báo đẩy"
                    onChange={() => updateSettings({ pushNotifications: !pushNotifications })}
                  />
                </div>
              </section>

              <section className="ps-card ps-setting-card ps-setting-card--wide" aria-labelledby="practice-settings-title">
                <div className="ps-card__title-row ps-card__title-row--top">
                  <div className="ps-setting-card__heading">
                    <span className="ps-icon-circle ps-icon-circle--practice"><Headphones aria-hidden="true" /></span>
                    <div>
                      <p className="ps-card__kicker">Luyện tập</p>
                      <h2 id="practice-settings-title">Âm thanh &amp; nhắc lịch</h2>
                    </div>
                  </div>
                </div>

                <div className="ps-practice-options">
                  <div className="ps-toggle-row">
                    <div>
                      <strong>Nhắc lịch luyện tập</strong>
                      <span>Nhận lời nhắc nhẹ nhàng để duy trì thói quen mỗi ngày</span>
                    </div>
                    <SettingSwitch
                      checked={practiceReminders}
                      label="Nhắc lịch luyện tập"
                      onChange={() => updateSettings({ practiceReminders: !practiceReminders })}
                    />
                  </div>

                  <div className="ps-toggle-row">
                    <div>
                      <strong>Âm thanh phản hồi</strong>
                      <span>Phát hiệu ứng âm thanh sau khi thu âm hoặc hoàn thành bài</span>
                    </div>
                    <SettingSwitch
                      checked={feedbackSounds}
                      label="Âm thanh phản hồi"
                      onChange={() => updateSettings({ feedbackSounds: !feedbackSounds })}
                    />
                  </div>
                </div>
              </section>
            </div>

            <section className="ps-card ps-security-card" aria-labelledby="security-title">
              <div className="ps-card__title-row ps-card__title-row--top">
                <div className="ps-setting-card__heading">
                  <span className="ps-icon-circle ps-icon-circle--security"><Shield aria-hidden="true" /></span>
                  <div>
                    <p className="ps-card__kicker">An toàn tài khoản</p>
                    <h2 id="security-title">Bảo mật</h2>
                  </div>
                </div>
                <span className="ps-security-status">
                  <span aria-hidden="true" />
                  Bảo vệ cơ bản
                </span>
              </div>

              <div className="ps-security-list">
                <div className="ps-security-row">
                  <span><KeyRound aria-hidden="true" /></span>
                  <div>
                    <strong>Mật khẩu</strong>
                    <small>Mật khẩu được mã hóa và quản lý bởi tài khoản GoodViet</small>
                  </div>
                  <span className="ps-security-row__status"><CheckCircle size={15} /> Được bảo vệ</span>
                </div>

                <div className="ps-security-row">
                  <span><LogOut aria-hidden="true" /></span>
                  <div>
                    <strong>Phiên đăng nhập hiện tại</strong>
                    <small>Đăng xuất an toàn khỏi thiết bị này</small>
                  </div>
                  <button type="button" onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            </section>

            <div className="ps-settings-footer" role="status"><CheckCircle aria-hidden="true" /> Đã đồng bộ các tùy chọn trên thiết bị</div>
          </section>
        </div>
      </div>
    </main>
  );
}
