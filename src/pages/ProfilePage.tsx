import { useState } from 'react';
import {
  BadgeCheck,
  Check,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  TrendingUp,
} from 'lucide-react';
import { toast } from '../components/common/Toast';
import { PageHeader } from '../components/layout/PageHeader';
import { useAuthStore } from '../store/authStore';
import '../styles/profile-settings.css';

function getDisplayDate(value?: string) {
  if (!value) return 'chưa xác định';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'chưa xác định';

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
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [targetGoals, setTargetGoals] = useState(user?.targetGoals || '');
  const [isSaving, setIsSaving] = useState(false);

  const resetDraft = () => {
    const names = splitUserName(user?.fullName);
    setLastName(names.lastName);
    setFirstName(names.firstName);
    setPhoneNumber(user?.phoneNumber || '');
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
    const normalizedPhone = phoneNumber.replace(/\s+/g, '');
    if (normalizedPhone && !/^0\d{9}$/.test(normalizedPhone)) {
      toast.error('Số điện thoại chưa hợp lệ', 'Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số và bắt đầu bằng 0.');
      return;
    }

    setIsSaving(true);

    try {
      const fullName = `${lastName.trim()} ${firstName.trim()}`.trim();
      await updateUser({ fullName, phoneNumber: normalizedPhone || undefined, targetGoals: targetGoals.trim() });
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
        <PageHeader
          eyebrow="Không gian cá nhân"
          title="Hồ sơ của bạn"
          description="Quản lý thông tin, mục tiêu luyện tập và trải nghiệm GoodViet trong một nơi."
        />

        <div className="ps-layout">
          <aside className="ps-sidebar" aria-label="Tóm tắt hồ sơ">
            <section className="ps-card ps-profile-card">
              <div className="ps-profile-card__banner" />
              <div className="ps-profile-card__body">
                <div className="ps-avatar-wrap">
                  <div className="ps-avatar" role="img" aria-label={`Ảnh đại diện của ${user?.fullName || 'người dùng GoodViet'}`}>
                    {user?.fullName?.trim().charAt(0).toUpperCase() || 'G'}
                  </div>
                </div>

                <h2>{user?.fullName || 'Nguyễn Văn A'}</h2>
                <p className="ps-profile-card__member">Thành viên từ {getDisplayDate(user?.createdAt)}</p>

                <div className="ps-badges" aria-label="Trạng thái tài khoản">
                  <span className="ps-badge ps-badge--primary">
                    {user?.verifiedEmail ? <BadgeCheck aria-hidden="true" /> : <Mail aria-hidden="true" />}
                    {user?.verifiedEmail ? 'Email đã xác minh' : 'Email chưa xác minh'}
                  </span>
                  <span className="ps-badge ps-badge--tertiary">
                    {user?.accountType === 'temporary' ? 'Tài khoản dùng thử' : 'Thành viên GoodViet'}
                  </span>
                </div>
              </div>
            </section>

            <section className="ps-card ps-activity-card" aria-labelledby="activity-title">
              <div className="ps-card__title-row">
                <div>
                  <p className="ps-card__kicker">Tổng quan</p>
                  <h2 id="activity-title">Hoạt động</h2>
                </div>
                <span className="ps-icon-circle"><TrendingUp aria-hidden="true" /></span>
              </div>
              <div className="ps-stat-grid">
                <div className="ps-stat">
                  <strong>{Math.round((user?.totalPracticeTime || 0) / 60)}</strong>
                  <span>Phút luyện tập</span>
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
                    <Pencil aria-hidden="true" />
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
                  <label htmlFor="profile-email">Email đăng nhập</label>
                  <div className="ps-field__with-icon">
                    <Mail aria-hidden="true" />
                    <div id="profile-email" className="ps-field__value ps-field__value--readonly">{user?.email || 'Chưa cập nhật'}</div>
                  </div>
                  <small className="ps-field__hint">Email đăng nhập được quản lý bởi hệ thống và không thể đổi tại đây.</small>
                </div>

                <div className="ps-field ps-field--wide">
                  <label htmlFor="profile-phone">Số điện thoại</label>
                  {isEditing ? (
                    <div className="ps-field__with-icon">
                      <Phone aria-hidden="true" />
                      <input
                        id="profile-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        placeholder="0901 234 567"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </div>
                  ) : (
                    <div className="ps-field__with-icon">
                      <Phone aria-hidden="true" />
                      <div id="profile-phone" className="ps-field__value">{user?.phoneNumber || 'Chưa cập nhật'}</div>
                    </div>
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
                      <LoaderCircle className="ps-spin" aria-hidden="true" />
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Check aria-hidden="true" />
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
