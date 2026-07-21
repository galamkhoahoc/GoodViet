import { useState } from 'react';

const EXPERTS = [
  { 
    id: 1, 
    name: "GS. Nguyễn Văn B", 
    title: "Chuyên gia Ngôn ngữ học", 
    rating: 4.9, 
    reviews: 120, 
    tags: ["Chỉnh âm", "Thực hành giao tiếp"], 
    avatar: "/images/avatars/expert_1_new.jpg",
    status: "available",
    fee: "500.000đ/giờ"
  },
  { 
    id: 2, 
    name: "ThS. Lê Trần", 
    title: "Chuyên gia Tâm lý", 
    rating: 4.8, 
    reviews: 85, 
    tags: ["Tâm lý học", "Đồng hành cảm xúc"], 
    avatar: "/images/avatars/expert_2_new.jpg",
    status: "busy",
    fee: "400.000đ/giờ"
  },
  { 
    id: 3, 
    name: "Bác sĩ Ngọc Phạm", 
    title: "Bác sĩ Trị liệu", 
    rating: 5.0, 
    reviews: 42, 
    tags: ["Trị liệu ngôn ngữ", "Nhi khoa"], 
    avatar: "/images/avatars/expert_3_new.jpg",
    status: "available",
    fee: "600.000đ/giờ"
  },
  { 
    id: 4, 
    name: "TS. Trần Hoàng", 
    title: "Cố vấn Giao tiếp", 
    rating: 4.7, 
    reviews: 200, 
    tags: ["Giao tiếp công sở", "Kỹ năng thuyết trình"], 
    avatar: "/images/avatars/expert_4_new.jpg",
    status: "available",
    fee: "450.000đ/giờ"
  },
  { 
    id: 5, 
    name: "ThS. Phạm Mai", 
    title: "Chuyên viên Giáo dục", 
    rating: 4.9, 
    reviews: 156, 
    tags: ["Phát triển ngôn ngữ", "Can thiệp sớm"], 
    avatar: "/images/avatars/expert_5_new.jpg",
    status: "available",
    fee: "350.000đ/giờ"
  },
  { 
    id: 6, 
    name: "BS. Hoàng Nam", 
    title: "Chuyên gia Thính học", 
    rating: 4.8, 
    reviews: 92, 
    tags: ["Thính lực", "Phục hồi chức năng"], 
    avatar: "/images/avatars/expert_6_new.jpg",
    status: "busy",
    fee: "550.000đ/giờ"
  },
];

export function FindExpertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedId, setRequestedId] = useState<number | null>(null);

  const filteredExperts = EXPERTS.filter(expert => 
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    expert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequest = (id: number) => {
    setRequestedId(id);
    setTimeout(() => {
      setRequestedId(null);
      alert('Đã gửi yêu cầu kết nối! Quản trị viên sẽ liên hệ để phê duyệt.');
    }, 1500);
  };

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background text-on-background">
      <div className="max-w-[1200px] mx-auto p-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display-lg text-display-lg font-bold tracking-tight mb-2">Tìm kiếm Chuyên gia</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Kết nối với các bác sĩ, nhà trị liệu và chuyên gia ngôn ngữ hàng đầu để nhận lộ trình can thiệp và hỗ trợ cá nhân hóa.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Tìm theo tên, chuyên ngành, kỹ năng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-lowest text-on-surface text-body-md pl-12 pr-4 py-3 rounded-2xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-lowest border border-outline-variant/30 rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm font-label-md font-medium">
             <span className="material-symbols-outlined text-[20px]">tune</span> Lọc kết quả
          </button>
        </div>

        {/* Categories / Tags */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
           <button className="px-5 py-2 bg-primary text-on-primary rounded-full font-label-md font-medium whitespace-nowrap shadow-sm">Tất cả</button>
           <button className="px-5 py-2 bg-surface-lowest border border-outline-variant/30 text-on-surface rounded-full font-label-md font-medium hover:bg-surface-container transition-colors whitespace-nowrap">Ngôn ngữ học</button>
           <button className="px-5 py-2 bg-surface-lowest border border-outline-variant/30 text-on-surface rounded-full font-label-md font-medium hover:bg-surface-container transition-colors whitespace-nowrap">Tâm lý học</button>
           <button className="px-5 py-2 bg-surface-lowest border border-outline-variant/30 text-on-surface rounded-full font-label-md font-medium hover:bg-surface-container transition-colors whitespace-nowrap">Trị liệu</button>
           <button className="px-5 py-2 bg-surface-lowest border border-outline-variant/30 text-on-surface rounded-full font-label-md font-medium hover:bg-surface-container transition-colors whitespace-nowrap">Can thiệp sớm</button>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map(expert => (
            <div key={expert.id} className="bg-surface-lowest organic-curve p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-outline-variant/30 soft-bounce flex flex-col">
               <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm border-2 border-surface-lowest relative flex-shrink-0">
                     <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                     <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface-lowest ${expert.status === 'available' ? 'bg-[#386a20]' : 'bg-[#ba1a1a]'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-title-lg font-bold text-on-surface leading-tight">{expert.name}</h3>
                    <p className="text-body-sm text-primary font-medium mb-1">{expert.title}</p>
                    <div className="flex items-center gap-1 text-sm text-on-surface-variant">
                       <span className="material-symbols-outlined text-[16px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                       <span className="font-bold text-on-surface">{expert.rating}</span>
                       <span>({expert.reviews} đánh giá)</span>
                    </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2 mb-6">
                 {expert.tags.map(tag => (
                   <span key={tag} className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[11px] rounded-md font-medium">#{tag}</span>
                 ))}
               </div>

               <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/20">
                 <div className="font-label-md text-on-surface-variant font-bold">{expert.fee}</div>
                 <button 
                   onClick={() => handleRequest(expert.id)}
                   disabled={requestedId === expert.id}
                   className={`px-6 py-2.5 rounded-full font-label-md font-bold transition-all shadow-sm flex items-center gap-2 ${requestedId === expert.id ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary text-on-primary hover:scale-[1.02]'}`}
                 >
                   {requestedId === expert.id ? (
                     <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                        Đang gửi...
                     </>
                   ) : (
                     'Gửi yêu cầu'
                   )}
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
