import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0">
      <div className="max-w-[1200px] mx-auto p-12 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <p className="font-title-md text-title-md text-on-surface-variant mb-1">Chào mừng {user?.fullName || 'bạn'} đến với nền tảng</p>
            <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight">Phát hiện sớm, can thiệp, đồng hành</h2>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-full overflow-hidden shadow-sm border-2 border-surface-lowest cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/profile')}
            >
              <img alt="User profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256" />
            </div>
          </div>
        </div>

        {/* Hero Banner / Inspiration */}
        <div className="relative w-full h-[240px] organic-curve overflow-hidden shadow-sm flex items-end p-8 soft-bounce group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-[center_25%] transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url('/images/hero_banner.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/40 to-transparent"></div>
          <div className="relative z-10 text-surface-lowest">
            <p className="font-headline-md text-headline-md font-medium leading-snug max-w-2xl">Nền tảng hỗ trợ đồng hành, luyện tập và kết nối chuyên gia cho người cần cải thiện trong giao tiếp tiếng Việt.</p>
          </div>
        </div>

        {/* Onboarding Steps Panel */}
        <section className="bg-surface-lowest p-8 organic-curve shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20 mt-4">
           <h3 className="font-headline-md text-headline-md text-on-surface mb-6 font-bold">Hành trình của bạn</h3>
           <div className="flex justify-between relative pl-4 mt-8">
              {/* Line connecting steps */}
              <div className="absolute left-[34px] top-6 bottom-6 w-1 bg-surface-container-high rounded-full -z-10 xl:hidden"></div>
              <div className="hidden xl:block absolute top-[34px] left-12 right-12 h-1 bg-surface-container-high rounded-full -z-10">
                 <div className="h-full bg-primary w-[50%] rounded-full"></div>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 w-full justify-between items-start xl:items-center">
                 
                 {/* Step 1 */}
                 <div className="flex xl:flex-col items-center xl:w-1/4 gap-4 xl:gap-6 group">
                   <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold shadow-md z-10 flex-shrink-0">
                      <span className="material-symbols-outlined text-[32px]">person</span>
                   </div>
                   <div className="xl:text-center text-left">
                     <span className="font-label-md text-primary font-bold uppercase tracking-wide block mb-1">Bước 1</span>
                     <h4 className="font-title-lg font-bold text-on-surface mb-2">Tạo hồ sơ</h4>
                     <p className="font-body-md text-on-surface-variant max-w-[200px] xl:mx-auto">Điền thông tin và mục tiêu cá nhân của bạn.</p>
                   </div>
                 </div>

                 {/* Step 2 */}
                 <div className="flex xl:flex-col items-center xl:w-1/4 gap-4 xl:gap-6 group">
                   <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold shadow-md z-10 flex-shrink-0 relative">
                     <span className="material-symbols-outlined text-[32px]">checklist</span>
                     <div className="absolute -top-2 -right-2 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">Cần làm</div>
                   </div>
                   <div className="xl:text-center text-left">
                     <span className="font-label-md text-primary font-bold uppercase tracking-wide block mb-1">Bước 2</span>
                     <h4 className="font-title-lg font-bold text-on-surface mb-2">Đánh giá 3 bài test</h4>
                     <p className="font-body-md text-on-surface-variant max-w-[200px] xl:mx-auto">Bài test sàng lọc, phát âm và câu hỏi chi tiết.</p>
                   </div>
                 </div>

                 {/* Step 3 */}
                 <div className="flex xl:flex-col items-center xl:w-1/4 gap-4 xl:gap-6  opacity-50">
                   <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant border-4 border-surface-lowest flex items-center justify-center font-headline-sm font-bold z-10 flex-shrink-0">
                     <span className="material-symbols-outlined text-[32px]">route</span>
                   </div>
                   <div className="xl:text-center text-left">
                     <span className="font-label-md text-on-surface-variant font-bold uppercase tracking-wide block mb-1">Bước 3</span>
                     <h4 className="font-title-lg font-bold text-on-surface mb-2">Nhận lộ trình</h4>
                     <p className="font-body-md text-on-surface-variant max-w-[200px] xl:mx-auto">Hệ thống đề xuất lộ trình và khoá học cá nhân hóa.</p>
                   </div>
                 </div>

                 {/* Step 4 */}
                 <div className="flex xl:flex-col items-center xl:w-1/4 gap-4 xl:gap-6 opacity-50">
                   <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant border-4 border-surface-lowest flex items-center justify-center font-headline-sm font-bold z-10 flex-shrink-0">
                     <span className="material-symbols-outlined text-[32px]">apps</span>
                   </div>
                   <div className="xl:text-center text-left">
                     <span className="font-label-md text-on-surface-variant font-bold uppercase tracking-wide block mb-1">Bước 4</span>
                     <h4 className="font-title-lg font-bold text-on-surface mb-2">Khám phá tính năng</h4>
                     <p className="font-body-md text-on-surface-variant max-w-[200px] xl:mx-auto">Truy cập toàn bộ tài nguyên, cố vấn và bài tập.</p>
                   </div>
                 </div>

              </div>
           </div>
           
           <div className="mt-12 flex justify-center w-full">
              <button 
                onClick={() => navigate('/assessment')}
                className="px-8 py-3 bg-primary text-on-primary font-title-md font-bold rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                 Thực hiện bài đánh giá ngay <span className="material-symbols-outlined">arrow_forward</span>
              </button>
           </div>
        </section>

      </div>
    </main>
  );
}
