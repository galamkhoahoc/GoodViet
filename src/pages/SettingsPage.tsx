import { useSettingsStore } from '../store/settingsStore';

export function SettingsPage() {
  const { language, emailNotifications, pushNotifications, updateSettings } = useSettingsStore();

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background">
      <div className="max-w-[1200px] mx-auto p-12 flex flex-col gap-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight mb-2">Cài đặt hệ thống</h2>
          <p className="text-body-lg text-on-surface-variant">Quản lý tùy chọn ngôn ngữ, thông báo và bảo mật của bạn.</p>
        </div>

        <div className="flex flex-col gap-8 max-w-4xl">
          <div className="flex gap-6">
            {/* Ngôn ngữ & Khu vực */}
            <div className="flex-1 bg-surface-lowest organic-curve p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20">
               <div className="flex items-center gap-3 mb-6">
                 <span className="material-symbols-outlined text-outline">language</span>
                 <h3 className="font-title-lg font-bold text-on-surface">Ngôn ngữ & Khu vực</h3>
               </div>
               <div className="mb-4 bg-surface-container-low p-4 rounded-xl border border-transparent flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors" onClick={() => updateSettings({ language: language === 'vi' ? 'en' : 'vi' })}>
                  <div>
                    <div className="font-label-md font-bold text-on-surface mb-1">Ngôn ngữ hiển thị</div>
                    <div className="text-body-sm text-on-surface-variant">{language === 'vi' ? 'Tiếng Việt' : 'English'}</div>
                  </div>
                  <span className="text-primary font-label-md font-medium">Thay đổi</span>
               </div>
               <div className="bg-surface-container-low p-4 rounded-xl border border-transparent cursor-pointer hover:bg-surface-container transition-colors">
                  <div className="font-label-md font-bold text-on-surface mb-1">Múi giờ</div>
                  <div className="text-body-sm text-on-surface-variant">Giờ Đông Dương (ICT)</div>
               </div>
            </div>

            {/* Thông báo */}
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
                  <div 
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${emailNotifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    onClick={() => updateSettings({ emailNotifications: !emailNotifications })}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full shadow-sm transition-all ${emailNotifications ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
               <div className="flex justify-between items-center">
                  <div>
                    <div className="font-label-md font-bold text-on-surface mb-1">Thông báo đẩy</div>
                    <div className="text-body-sm text-on-surface-variant">Tin nhắn & nhắc nhở</div>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${pushNotifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    onClick={() => updateSettings({ pushNotifications: !pushNotifications })}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full shadow-sm transition-all ${pushNotifications ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bảo mật tài khoản */}
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
        </div>
      </div>
    </main>
  );
}
