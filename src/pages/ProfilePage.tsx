import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import '../styles/profile-settings.css';

function getDisplayDate(value?: string) {
  if (!value) return 'tháng 10/2023';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'tháng 10/2023';

  return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
}

function splitUserName(fullName?: string) {
  const names = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    lastName: names[0] || '',
    firstName: names.slice(1).join(' ') || '',
  };
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const currentName = splitUserName(user?.fullName);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentName.firstName);
  const [lastName, setLastName] = useState(currentName.lastName);
  const [targetGoals, setTargetGoals] = useState(user?.targetGoals || '');
  const [isSaving, setIsSaving] = useState(false);

  const resetDraft = () => {
    const names = splitUserName(user?.fullName);
    setLastName(names.lastName);
    setFirstName(names.firstName);
    setTargetGoals(user?.targetGoals || '');
  };

  const beginEditing = () => {
    resetDraft();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetDraft();
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const fullName = `${lastName.trim()} ${firstName.trim()}`.trim();
      await updateUser({ fullName, targetGoals: targetGoals.trim() });
      toast.success('Đã lưu thay đổi', 'Thông tin hồ sơ của bạn đã được cập nhật.');
      setIsEditing(false);
    } catch {
      toast.error('Không thể cập nhật', 'Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="ps-page">
      <div className="ps-page__inner">
        <header className="ps-page__header">
          <p className="ps-page__eyebrow">
            <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
            Không gian cá nhân
          </p>
          <h1>Hồ sơ &amp; Cài đặt</h1>
          <p>Quản lý thông tin, mục tiêu luyện tập và trải nghiệm GoodViet của bạn.</p>
        </header>

        <div className="ps-layout">
          <aside className="ps-sidebar" aria-label="Tóm tắt hồ sơ">
            <section className="ps-card ps-profile-card">
              <div className="ps-profile-card__banner" />
              <div className="ps-profile-card__body">
                <div className="ps-avatar-wrap">
                  <img
                    className="ps-avatar"
                    src="/images/avatars/expert_1.png"
                    alt={`Ảnh đại diện của ${user?.fullName || 'người dùng GoodViet'}`}
                  />
                  <button className="ps-avatar-edit" type="button" aria-label="Thay ảnh đại diện">
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  </button>
                </div>

                <h2>{user?.fullName || 'Nguyễn Văn A'}</h2>
                <p className="ps-profile-card__member">Thành viên từ {getDisplayDate(user?.createdAt)}</p>

                <div className="ps-badges" aria-label="Trạng thái tài khoản">
                  <span className="ps-badge ps-badge--primary">
                    <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                    Đã xác minh
                  </span>
                  <span className="ps-badge ps-badge--tertiary">Premium</span>
                </div>

                <div className="ps-contact-list">
                  <p>
                    <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                    <span>{user?.email || 'nguyen.vana@example.com'}</span>
                  </p>
                  <p>
                    <span className="material-symbols-outlined" aria-hidden="true">phone</span>
                    <span>{user?.phoneNumber || 'Chưa cập nhật số điện thoại'}</span>
                  </p>
                  <p>
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    <span>TP. Hồ Chí Minh, Việt Nam</span>
                  </p>
                </div>
              </div>
            </section>

            <section className="ps-card ps-activity-card" aria-labelledby="activity-title">
              <div className="ps-card__title-row">
                <div>
                  <p className="ps-card__kicker">Tổng quan</p>
                  <h2 id="activity-title">Hoạt động</h2>
                </div>
                <span className="ps-icon-circle material-symbols-outlined" aria-hidden="true">monitoring</span>
              </div>
              <div className="ps-stat-grid">
                <div className="ps-stat">
                  <strong>{user?.currentStreak || 0}</strong>
                  <span>Ngày liên tiếp</span>
                </div>
                <div className="ps-stat">
                  <strong>{user?.totalRecordings || 0}</strong>
                  <span>Bản thu âm</span>
                </div>
              </div>
            </section>
          </aside>

          <section className="ps-content" aria-label="Chi tiết hồ sơ">
            <section className="ps-card ps-info-card" aria-labelledby="personal-info-title">
              <div className="ps-card__title-row ps-card__title-row--top">
                <div>
                  <p className="ps-card__kicker">Tài khoản của bạn</p>
                  <h2 id="personal-info-title">Thông tin cá nhân</h2>
                </div>
                {!isEditing && (
                  <button className="ps-text-button" type="button" onClick={beginEditing}>
                    <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="ps-form-grid">
                <div className="ps-field">
                  <label htmlFor="profile-last-name">Họ</label>
                  {isEditing ? (
                    <input
                      id="profile-last-name"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                    />
                  ) : (
                    <div className="ps-field__value">{currentName.lastName || 'Chưa cập nhật'}</div>
                  )}
                </div>

                <div className="ps-field">
                  <label htmlFor="profile-first-name">Tên đệm và tên</label>
                  {isEditing ? (
                    <input
                      id="profile-first-name"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="ps-field__value">{currentName.firstName || 'Chưa cập nhật'}</div>
                  )}
                </div>

                <div className="ps-field ps-field--wide">
                  <label htmlFor="profile-goals">Mục tiêu luyện tập</label>
                  {isEditing ? (
                    <textarea
                      id="profile-goals"
                      rows={4}
                      value={targetGoals}
                      onChange={(event) => setTargetGoals(event.target.value)}
                      placeholder="Ví dụ: Nói rõ âm L/N và tự tin hơn khi thuyết trình..."
                    />
                  ) : (
                    <div className="ps-field__value ps-field__value--multiline">
                      {user?.targetGoals || 'Bạn chưa cập nhật mục tiêu luyện tập.'}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="ps-shortcut-grid">
              <Link className="ps-card ps-shortcut-card" to="/settings">
                <span className="ps-icon-circle material-symbols-outlined" aria-hidden="true">language</span>
                <span>
                  <strong>Ngôn ngữ &amp; Khu vực</strong>
                  <small>Tiếng Việt · Giờ Đông Dương</small>
                </span>
                <span className="material-symbols-outlined ps-shortcut-card__arrow" aria-hidden="true">arrow_forward</span>
              </Link>

              <Link className="ps-card ps-shortcut-card" to="/settings">
                <span className="ps-icon-circle ps-icon-circle--tertiary material-symbols-outlined" aria-hidden="true">notifications</span>
                <span>
                  <strong>Thông báo</strong>
                  <small>Email, tin nhắn và nhắc lịch</small>
                </span>
                <span className="material-symbols-outlined ps-shortcut-card__arrow" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>

            {isEditing && (
              <div className="ps-actions" aria-label="Thao tác chỉnh sửa hồ sơ">
                <button
                  className="ps-button ps-button--ghost"
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button className="ps-button ps-button--primary" type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined ps-spin" aria-hidden="true">progress_activity</span>
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" aria-hidden="true">check</span>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
