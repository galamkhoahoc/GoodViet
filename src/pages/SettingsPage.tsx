import { Link } from 'react-router-dom';
import { toast } from '../components/common/Toast';
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
  const user = useAuthStore((state) => state.user);
  const { language, timezone, emailNotifications, pushNotifications, updateSettings } = useSettingsStore();

  const showSecurityNotice = (feature: string) => {
    toast.info(`${feature} đang được hoàn thiện`, 'Tính năng này sẽ sớm có mặt trong bản cập nhật tiếp theo.');
  };

  return (
    <main className="ps-page">
      <div className="ps-page__inner">
        <header className="ps-page__header">
          <p className="ps-page__eyebrow">
            <span className="material-symbols-outlined" aria-hidden="true">tune</span>
            Tùy chỉnh trải nghiệm
          </p>
          <h1>Cài đặt tài khoản</h1>
          <p>Quản lý ngôn ngữ, thông báo và bảo mật trong một không gian thống nhất.</p>
        </header>

        <div className="ps-layout">
          <aside className="ps-sidebar" aria-label="Điều hướng tài khoản">
            <section className="ps-card ps-account-card">
              <div className="ps-account-card__identity">
                <img src="/images/avatars/expert_1.png" alt="Ảnh đại diện người dùng" />
                <div>
                  <h2>{user?.fullName || 'Nguyễn Văn A'}</h2>
                  <p>{user?.email || 'nguyen.vana@example.com'}</p>
                </div>
              </div>

              <nav className="ps-account-nav" aria-label="Hồ sơ và cài đặt">
                <Link to="/profile">
                  <span className="material-symbols-outlined" aria-hidden="true">person</span>
                  Hồ sơ cá nhân
                  <span className="material-symbols-outlined ps-account-nav__arrow" aria-hidden="true">chevron_right</span>
                </Link>
                <Link className="ps-account-nav__active" to="/settings" aria-current="page">
                  <span className="material-symbols-outlined" aria-hidden="true">settings</span>
                  Cài đặt tài khoản
                  <span className="material-symbols-outlined ps-account-nav__arrow" aria-hidden="true">chevron_right</span>
                </Link>
              </nav>
            </section>

            <section className="ps-card ps-save-note">
              <span className="ps-icon-circle material-symbols-outlined" aria-hidden="true">cloud_done</span>
              <div>
                <h2>Tự động lưu</h2>
                <p>Mọi thay đổi trên trang này được lưu ngay trên thiết bị của bạn.</p>
              </div>
            </section>
          </aside>

          <section className="ps-content" aria-label="Các tùy chọn tài khoản">
            <div className="ps-settings-grid">
              <section className="ps-card ps-setting-card" aria-labelledby="language-region-title">
                <div className="ps-card__title-row ps-card__title-row--top">
                  <div className="ps-setting-card__heading">
                    <span className="ps-icon-circle material-symbols-outlined" aria-hidden="true">language</span>
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
                    <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
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
                    <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
                  </div>
                </div>
              </section>

              <section className="ps-card ps-setting-card" aria-labelledby="notifications-title">
                <div className="ps-card__title-row ps-card__title-row--top">
                  <div className="ps-setting-card__heading">
                    <span className="ps-icon-circle ps-icon-circle--tertiary material-symbols-outlined" aria-hidden="true">notifications</span>
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
            </div>

            <section className="ps-card ps-security-card" aria-labelledby="security-title">
              <div className="ps-card__title-row ps-card__title-row--top">
                <div className="ps-setting-card__heading">
                  <span className="ps-icon-circle ps-icon-circle--security material-symbols-outlined" aria-hidden="true">shield</span>
                  <div>
                    <p className="ps-card__kicker">An toàn tài khoản</p>
                    <h2 id="security-title">Bảo mật</h2>
                  </div>
                </div>
                <span className="ps-security-status">
                  <span aria-hidden="true" />
                  Đang bảo vệ
                </span>
              </div>

              <div className="ps-security-list">
                <div className="ps-security-row">
                  <span className="material-symbols-outlined" aria-hidden="true">password</span>
                  <div>
                    <strong>Mật khẩu</strong>
                    <small>Thay đổi lần cuối khoảng 3 tháng trước</small>
                  </div>
                  <button type="button" onClick={() => showSecurityNotice('Đổi mật khẩu')}>Cập nhật</button>
                </div>

                <div className="ps-security-row">
                  <span className="material-symbols-outlined" aria-hidden="true">phonelink_lock</span>
                  <div>
                    <strong>Xác thực hai yếu tố</strong>
                    <small><span className="ps-online-dot" aria-hidden="true" /> Hiện đang bật</small>
                  </div>
                  <button type="button" onClick={() => showSecurityNotice('Xác thực hai yếu tố')}>Quản lý</button>
                </div>
              </div>
            </section>

            <div className="ps-settings-footer" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
              Các thay đổi được lưu tự động
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
