import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background">
      <div className="max-w-[1200px] mx-auto p-12 flex flex-col gap-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight mb-2">Cài đặt tài khoản</h2>
          <p className="text-body-lg text-on-surface-variant">Quản lý hồ sơ, tùy chọn và thông tin bảo mật của bạn.</p>
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
              <p className="text-body-md text-on-surface-variant mb-4">Thành viên từ T10 2023</p>
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
                    <div className="font-display-sm font-bold text-primary mb-1">14</div>
                    <div className="text-label-md text-on-surface-variant">Chuỗi ngày</div>
                 </div>
                 <div className="flex-1 bg-surface-container-low rounded-2xl p-4 text-center border border-outline-variant/10">
                    <div className="font-display-sm font-bold text-primary mb-1">48</div>
                    <div className="text-label-md text-on-surface-variant">Bài học</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-sm font-bold text-on-surface">Thông tin cá nhân</h3>
                  <button className="text-primary font-label-lg font-bold hover:underline">Chỉnh sửa</button>
               </div>
               <div className="flex gap-6 mb-4">
                 <div className="flex-1">
                   <label className="block font-label-md text-on-surface-variant mb-2">Tên</label>
                   <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface">Văn A</div>
                 </div>
                 <div className="flex-1">
                   <label className="block font-label-md text-on-surface-variant mb-2">Họ</label>
                   <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface">Nguyễn</div>
                 </div>
               </div>
               <div>
                 <label className="block font-label-md text-on-surface-variant mb-2">Giới thiệu</label>
                 <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-transparent text-on-surface min-h-[100px]">Đam mê bảo tồn di sản văn hóa Việt Nam và khám phá những góc nhìn hiện đại về nghề thủ công truyền thống.</div>
               </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-1 bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
                 <div className="flex items-center gap-3 mb-6">
                   <span className="material-symbols-outlined text-outline">language</span>
                   <h3 className="font-title-lg font-bold text-on-surface">Ngôn ngữ & Khu vực</h3>
                 </div>
                 <div className="mb-4 bg-surface-container-low p-4 rounded-xl border border-transparent flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors">
                    <div>
                      <div className="font-label-md font-bold text-on-surface mb-1">Ngôn ngữ hiển thị</div>
                      <div className="text-body-sm text-on-surface-variant">Tiếng Việt</div>
                    </div>
                    <span className="text-primary font-label-md font-medium">Thay đổi</span>
                 </div>
                 <div className="bg-surface-container-low p-4 rounded-xl border border-transparent cursor-pointer hover:bg-surface-container transition-colors">
                    <div className="font-label-md font-bold text-on-surface mb-1">Múi giờ</div>
                    <div className="text-body-sm text-on-surface-variant">Giờ Đông Dương (ICT)</div>
                 </div>
              </div>

              <div className="flex-1 bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
                 <div className="flex items-center gap-3 mb-6">
                   <span className="material-symbols-outlined text-outline">notifications</span>
                   <h3 className="font-title-lg font-bold text-on-surface">Thông báo</h3>
                 </div>
                 <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="font-label-md font-bold text-on-surface mb-1">Email tổng hợp</div>
                      <div className="text-body-sm text-on-surface-variant">Tin tức hàng tuần</div>
                    </div>
                    {/* Toggle Switch styling */}
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-on-primary rounded-full shadow-sm"></div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                      <div className="font-label-md font-bold text-on-surface mb-1">Thông báo đẩy</div>
                      <div className="text-body-sm text-on-surface-variant">Tin nhắn & nhắc nhở</div>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-on-primary rounded-full shadow-sm"></div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-error">security</span>
                <h3 className="font-title-lg font-bold text-on-surface">Bảo mật tài khoản</h3>
              </div>
              <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl mb-4 border border-transparent">
                 <div className="flex items-center gap-4">
                   <span className="material-symbols-outlined text-on-surface-variant p-2 bg-surface-lowest rounded-full shadow-sm">password</span>
                   <div>
                     <div className="font-label-md font-bold text-on-surface mb-1">Mật khẩu</div>
                     <div className="text-body-sm text-on-surface-variant">Thay đổi lần cuối 3 tháng trước</div>
                   </div>
                 </div>
                 <button className="px-5 py-2 border border-outline-variant/30 rounded-full font-label-md hover:bg-surface-container transition-colors font-medium bg-surface-lowest">Cập nhật</button>
              </div>
              <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl border border-transparent">
                 <div className="flex items-center gap-4">
                   <span className="material-symbols-outlined text-on-surface-variant p-2 bg-surface-lowest rounded-full shadow-sm">smartphone</span>
                   <div>
                     <div className="font-label-md font-bold text-on-surface mb-1">Xác thực hai yếu tố (2FA)</div>
                     <div className="text-body-sm text-on-surface-variant flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary relative"><div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50"></div></div> Đang bật
                     </div>
                   </div>
                 </div>
                 <button className="px-5 py-2 border border-outline-variant/30 rounded-full font-label-md hover:bg-surface-container transition-colors font-medium bg-surface-lowest">Quản lý</button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <button className="px-6 py-2.5 rounded-full font-label-lg font-medium text-on-surface hover:bg-surface-container transition-colors">Hủy</button>
               <button className="px-8 py-2.5 rounded-full font-label-lg font-medium bg-primary text-on-primary hover:scale-[1.02] shadow-sm transition-transform">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
