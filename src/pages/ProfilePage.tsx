import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/common/Toast';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [targetGoals, setTargetGoals] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const names = (user.fullName || '').split(' ');
      const lName = names[0] || '';
      const fName = names.slice(1).join(' ') || '';
      setLastName(lName);
      setFirstName(fName);
      setTargetGoals(user.targetGoals || '');
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${lastName} ${firstName}`.trim();
      await updateUser({ fullName, targetGoals });
      toast.success('Thành công', 'Thông tin của bạn đã được cập nhật.');
      setIsEditing(false);
    } catch (error) {
      toast.error('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background">
      <div className="max-w-[1200px] mx-auto p-12 flex flex-col gap-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight mb-2">Hồ sơ cá nhân</h2>
          <p className="text-body-lg text-on-surface-variant">Quản lý thông tin hồ sơ và mục tiêu học tập của bạn.</p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Left Column */}
          <div className="w-[340px] flex flex-col gap-6">
            <div className="bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20 text-center flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-high mb-4 relative shadow-sm border-4 border-surface-lowest">
                <img alt="User" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" className="w-full h-full object-cover" />
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-2 border-surface-lowest hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{user?.fullName || 'Nguyễn Văn A'}</h3>
              <p className="text-body-md text-on-surface-variant mb-4">Thành viên từ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' }) : 'T10 2023'}</p>
              <div className="flex flex-col gap-2 w-full mt-2">
                 <span className="inline-block px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-sm font-medium w-fit mx-auto">Người sáng tạo</span>
                 <span className="inline-block px-3 py-1.5 bg-tertiary-container text-on-tertiary-container rounded-full font-label-sm font-medium w-fit mx-auto transition-colors">Tài khoản Premium</span>
              </div>
              <hr className="w-full my-6 border-outline-variant/20" />
              <div className="w-full flex flex-col gap-4 text-left">
                <div className="flex items-center gap-3 text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px] text-primary">email</span>
                  <span className="truncate">{user?.email || 'nguyen.vana@example.com'}</span>
                </div>
                <div className="flex items-center gap-3 text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px] text-primary">phone</span>
                  <span>{user?.phoneNumber || '+84 90 123 4567'}</span>
                </div>
                <div className="flex items-center gap-3 text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                  <span>TP. Hồ Chí Minh, VN</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
              <h4 className="font-title-lg font-bold mb-4 text-on-surface">Hoạt động</h4>
              <div className="flex gap-4">
                 <div className="flex-1 bg-surface-container-low rounded-2xl p-4 text-center border border-outline-variant/10">
                    <div className="font-display-sm font-bold text-primary mb-1">{user?.currentStreak || 0}</div>
                    <div className="text-label-md text-on-surface-variant">Chuỗi ngày</div>
                 </div>
                 <div className="flex-1 bg-surface-container-low rounded-2xl p-4 text-center border border-outline-variant/10">
                    <div className="font-display-sm font-bold text-primary mb-1">{user?.totalRecordings || 0}</div>
                    <div className="text-label-md text-on-surface-variant">Bản thu âm</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-sm font-bold text-on-surface">Thông tin cá nhân</h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-primary font-label-lg font-bold hover:underline">Chỉnh sửa</button>
                  )}
               </div>
               <div className="flex gap-6 mb-4">
                 <div className="flex-1">
                   <label className="block font-label-md text-on-surface-variant mb-2">Họ</label>
                   {isEditing ? (
                     <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface focus:border-primary focus:outline-none" />
                   ) : (
                     <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface">{lastName || 'Chưa cập nhật'}</div>
                   )}
                 </div>
                 <div className="flex-1">
                   <label className="block font-label-md text-on-surface-variant mb-2">Tên</label>
                   {isEditing ? (
                     <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface focus:border-primary focus:outline-none" />
                   ) : (
                     <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface">{firstName || 'Chưa cập nhật'}</div>
                   )}
                 </div>
               </div>
               <div>
                 <label className="block font-label-md text-on-surface-variant mb-2">Giới thiệu (Mục tiêu học tập)</label>
                 {isEditing ? (
                   <textarea rows={3} value={targetGoals} onChange={e => setTargetGoals(e.target.value)} className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface focus:border-primary focus:outline-none resize-none" placeholder="Hãy chia sẻ về mục tiêu của bạn..." />
                 ) : (
                   <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface min-h-[80px]">
                     {targetGoals || 'Bạn chưa cập nhật mục tiêu học tập.'}
                   </div>
                 )}
               </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 mt-4 animate-fade-in">
                 <button onClick={handleCancel} disabled={isSaving} className="px-6 py-2.5 rounded-full font-label-lg font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">Hủy</button>
                 <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 rounded-full font-label-lg font-medium bg-primary text-on-primary hover:scale-[1.02] shadow-sm transition-transform disabled:opacity-50 flex items-center gap-2">
                   {isSaving ? (
                     <>Đang lưu <span className="material-symbols-outlined animate-spin text-[18px]">sync</span></>
                   ) : (
                     'Lưu thay đổi'
                   )}
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

