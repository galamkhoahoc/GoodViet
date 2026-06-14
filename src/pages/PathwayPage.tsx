export function PathwayPage() {
  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background text-on-background">
      <div className="max-w-[1200px] mx-auto p-12">
        <h2 className="font-display-lg text-display-lg font-bold tracking-tight mb-8">Thư viện luyện tập</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
             <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-6 overflow-hidden">
                <span className="material-symbols-outlined text-[28px]">receipt_long</span>
             </div>
             <h3 className="font-title-lg font-bold mb-2 text-on-surface">Giao tiếp hàng ngày</h3>
             <p className="font-body-md text-on-surface-variant mb-6 line-clamp-2">Luyện tập các mẫu câu phổ biến khi đi chợ, mua sắm và đi lại hàng ngày.</p>
             <div className="flex justify-between items-center">
               <span className="font-label-sm bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant font-medium">24 Bài học</span>
               <button className="text-primary group-hover:translate-x-1 transition-transform">
                 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
               </button>
             </div>
          </div>

          <div className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
             <div className="w-14 h-14 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center mb-6 overflow-hidden">
                <span className="material-symbols-outlined text-[28px]">museum</span>
             </div>
             <h3 className="font-title-lg font-bold mb-2 text-on-surface">Văn hóa & Lịch sử</h3>
             <p className="font-body-md text-on-surface-variant mb-6 line-clamp-2">Nâng cao từ vựng qua các câu chuyện thú vị về truyền thống văn hóa Việt Nam.</p>
             <div className="flex justify-between items-center">
               <span className="font-label-sm bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant font-medium">12 Bài học</span>
               <button className="text-primary group-hover:translate-x-1 transition-transform">
                 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
               </button>
             </div>
          </div>
          
          <div className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
             <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 overflow-hidden">
                <span className="material-symbols-outlined text-[28px]">business_center</span>
             </div>
             <h3 className="font-title-lg font-bold mb-2 text-on-surface">Tiếng Việt Công sở</h3>
             <p className="font-body-md text-on-surface-variant mb-6 line-clamp-2">Từ vựng trang trọng và ngữ điệu phù hợp cho môi trường làm việc chuyên nghiệp.</p>
             <div className="flex justify-between items-center">
               <span className="font-label-sm bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant font-medium">8 Bài học</span>
               <button className="text-primary group-hover:translate-x-1 transition-transform">
                 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
               </button>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
