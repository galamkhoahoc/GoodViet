import { useState } from 'react';

export function PathwayPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const categories = {
    'daily': {
      title: 'Giao tiếp hàng ngày',
      icon: 'receipt_long',
      color: 'bg-primary-container text-on-primary-container',
      lessons: [
        { id: 'd1', name: 'Bài 1: Chào hỏi cơ bản', duration: '5 phút' },
        { id: 'd2', name: 'Bài 2: Mua sắm ở chợ', duration: '8 phút' },
        { id: 'd3', name: 'Bài 3: Hỏi đường đi', duration: '6 phút' },
      ]
    },
    'culture': {
      title: 'Văn hóa & Lịch sử',
      icon: 'museum',
      color: 'bg-tertiary-container text-on-tertiary-container',
      lessons: [
        { id: 'c1', name: 'Bài 1: Tết Nguyên Đán', duration: '10 phút' },
        { id: 'c2', name: 'Bài 2: Áo dài truyền thống', duration: '7 phút' },
      ]
    },
    'work': {
      title: 'Tiếng Việt Công sở',
      icon: 'business_center',
      color: 'bg-secondary-container text-on-secondary-container',
      lessons: [
        { id: 'w1', name: 'Bài 1: Viết email chuyên nghiệp', duration: '12 phút' },
        { id: 'w2', name: 'Bài 2: Thuyết trình cuộc họp', duration: '15 phút' },
      ]
    }
  };

  const handleOpenCategory = (id: string) => {
    setSelectedCategory(id);
    setActiveLesson(null);
  };

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background text-on-background relative">
      <div className="max-w-[1200px] mx-auto p-12">
        <h2 className="font-display-lg text-display-lg font-bold tracking-tight mb-8">Thư viện luyện tập</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => handleOpenCategory('daily')} className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
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

          <div onClick={() => handleOpenCategory('culture')} className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
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
          
          <div onClick={() => handleOpenCategory('work')} className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce cursor-pointer group">
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

      {/* Experimental Prototype Modal */}
      {selectedCategory && categories[selectedCategory as keyof typeof categories] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-lowest w-full max-w-2xl organic-curve p-8 shadow-xl border border-outline-variant/20 m-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${categories[selectedCategory as keyof typeof categories].color}`}>
                     <span className="material-symbols-outlined text-[24px]">{categories[selectedCategory as keyof typeof categories].icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display-sm font-bold text-on-surface">{categories[selectedCategory as keyof typeof categories].title}</h3>
                    <p className="text-body-sm text-on-surface-variant">Bản thử nghiệm (Prototype)</p>
                  </div>
               </div>
               <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>

            {activeLesson ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 animate-in slide-in-from-right-4">
                 <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-primary font-label-md mb-4 hover:opacity-80">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Quay lại danh sách
                 </button>
                 <h4 className="font-title-lg font-bold mb-4">{categories[selectedCategory as keyof typeof categories].lessons.find(l => l.id === activeLesson)?.name}</h4>
                 
                 <div className="bg-surface-container p-6 rounded-xl text-center mb-6">
                    <span className="material-symbols-outlined text-[48px] text-primary mb-2 opacity-50">record_voice_over</span>
                    <p className="font-body-md text-on-surface-variant">Chế độ luyện tập tương tác sẽ xuất hiện ở đây.</p>
                 </div>
                 
                 <div className="flex justify-center gap-4">
                    <button className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-md shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">play_arrow</span> Nghe mẫu
                    </button>
                    <button className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-md shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">mic</span> Ghi âm thử
                    </button>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {categories[selectedCategory as keyof typeof categories].lessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-surface-lowest border border-outline-variant/30 rounded-2xl hover:border-primary/50 hover:bg-surface-container-lowest transition-colors group cursor-pointer" onClick={() => setActiveLesson(lesson.id)}>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                           <span className="material-symbols-outlined text-[20px]">play_lesson</span>
                        </div>
                        <div>
                          <p className="font-title-md font-bold text-on-surface group-hover:text-primary transition-colors">{lesson.name}</p>
                          <p className="text-body-sm text-on-surface-variant">{lesson.duration}</p>
                        </div>
                     </div>
                     <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined">chevron_right</span>
                     </button>
                  </div>
                ))}
                
                <div className="p-4 border border-dashed border-outline-variant/40 rounded-2xl text-center text-on-surface-variant text-body-sm mt-2">
                   Các bài học khác đang được cập nhật...
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </main>
  );
}
