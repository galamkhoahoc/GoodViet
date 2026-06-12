import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Flame, TrendingUp, BookOpen, Headphones, Mic, ChevronLeft, ChevronRight } from 'lucide-react';

export function PathwayPage() {
  const user = useAuthStore(s => s.user);
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Format date as "Thứ Năm, 24 Tháng 10"
  const formatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayName}, ${day} Tháng ${month}`;
  };

  // Sample data for daily exercises
  const exercises = [
    {
      id: 1,
      type: 'Đọc hiểu',
      icon: <BookOpen size={24} />,
      title: 'Văn hóa Trà',
      status: 'Chưa làm',
      statusColor: 'bg-[#9ca3af]',
      progress: 0,
    },
    {
      id: 2,
      type: 'Nghe',
      icon: <Headphones size={24} />,
      title: 'Podcast Lịch sử',
      status: 'Đang làm',
      statusColor: 'bg-[#1f2937]',
      progress: 45,
    },
    {
      id: 3,
      type: 'Nói',
      icon: <Mic size={24} />,
      title: 'Giao tiếp hàng ngày',
      status: 'Chưa làm',
      statusColor: 'bg-[#9ca3af]',
      progress: 0,
    },
  ];

  // Sample recommendations
  const recommendations = [
    { id: 1, title: 'Luyện phát âm cơ bản', description: 'Bài học phù hợp với bạn' },
    { id: 2, title: 'Từ vựng thiết yếu', description: '100 từ quan trọng' },
  ];

  // Calendar generation
  const generateCalendar = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const calendar = [];
    let week = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    
    // Fill remaining cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      calendar.push(week);
    }
    
    return calendar;
  };

  const calendar = generateCalendar(currentMonth);
  const completedDays = [5, 8, 10, 12, 15, 17, 19, 21, 22, 23, 24]; // Sample completed days
  const currentDay = currentDate.getDate();
  const isCurrentMonth = currentMonth.getMonth() === currentDate.getMonth() && 
                         currentMonth.getFullYear() === currentDate.getFullYear();

  return (
    <div className="bg-[#ecefe5] relative min-h-full flex flex-col font-plus-jakarta rounded-[28px] overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 px-[40px] py-[32px] pb-[96px] flex flex-col gap-[32px] max-w-[1280px] mx-auto w-full">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[4px]">
            <p className="text-[14px] text-[#42493c] tracking-[0.25px]">
              {formatDate(currentDate)}
            </p>
            <h1 className="text-[32px] font-bold text-[#191d17] leading-[40px]">
              Tiến độ hôm nay
            </h1>
          </div>
          <div className="w-[48px] h-[48px] rounded-full bg-[#d8e7cb] flex items-center justify-center text-[20px] text-[#205107] font-bold shadow-sm">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {/* Hero Banner with Quote */}
        <div className="rounded-[28px] p-[48px] md:p-[56px] min-h-[200px] flex flex-col justify-center relative overflow-hidden shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(32,81,7,0.9)] to-[rgba(56,102,102,0.8)] z-10"></div>
          <img src="https://images.unsplash.com/photo-1544717684-3f9c12542e01?w=1200" alt="Hero background" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 z-0" />
          
          <div className="relative z-20 flex flex-col gap-[12px] max-w-[700px]">
            <p className="text-[24px] md:text-[28px] font-bold text-white leading-[1.4]">
              "Học một ngôn ngữ mới là mở ra một cánh cửa mới của thế giới"
            </p>
            <p className="text-[16px] text-white/80 font-medium tracking-[0.5px]">
              — Khuyết danh
            </p>
          </div>
        </div>

        {/* Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {/* Streak Card */}
          <div className="bg-[#386666] rounded-[24px] p-[32px] text-white shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-[12px] mb-[24px]">
              <Flame size={24} className="text-white" />
              <span className="text-[16px] font-medium opacity-90 tracking-[0.5px]">Chuỗi ngày</span>
            </div>
            <div className="text-[64px] font-bold leading-[1] mb-[8px]">14</div>
            <div className="text-[16px] font-medium opacity-80 tracking-[0.5px]">Ngày</div>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-white rounded-[24px] p-[32px] flex flex-col items-center justify-center shadow-sm">
            <div className="relative w-[140px] h-[140px] mb-[24px]">
              <svg width="140" height="140" className="-rotate-90 transform">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="#205107" strokeWidth="12" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={2 * Math.PI * 60 * (1 - 0.75)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[36px] font-bold text-[#205107]">75%</div>
              </div>
            </div>
            <div className="text-[18px] font-bold text-[#191d17] mb-[4px]">Mục tiêu hôm nay</div>
            <div className="text-[14px] font-medium text-[#42493c] tracking-[0.25px]">Còn lại 15 phút</div>
          </div>

          {/* Weekly Progress Card */}
          <div className="bg-white rounded-[24px] p-[32px] shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-[12px] mb-[24px]">
              <TrendingUp size={24} className="text-[#205107]" />
              <span className="text-[16px] font-bold text-[#191d17]">Tuần này</span>
            </div>
            <div className="flex items-end gap-[12px] h-[100px] mb-[24px]">
              {[40, 65, 80, 100, 50, 30, 20].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[8px]">
                  <div className={`w-full rounded-t-[8px] transition-all duration-500 ease-out ${i < 4 ? 'bg-[#205107]' : 'bg-[#e5e7eb]'}`} style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[14px] font-medium text-[#42493c] text-center tracking-[0.25px]">
              4/7 ngày hoàn thành
            </div>
          </div>
        </div>

        {/* Daily Exercises Section */}
        <div className="flex flex-col gap-[24px]">
          <h2 className="text-[24px] font-bold text-[#191d17]">
            Bài tập hôm nay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-[28px] p-[32px] cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm flex flex-col group border border-transparent hover:border-[#d8e7cb]">
                <div className="w-[56px] h-[56px] rounded-[16px] bg-[#ecefe5] flex items-center justify-center text-[#205107] mb-[24px] group-hover:bg-[#d8e7cb] transition-colors">
                  {exercise.icon}
                </div>
                <div className={`${exercise.statusColor} text-white px-[12px] py-[6px] rounded-[8px] text-[12px] font-bold tracking-[0.5px] inline-flex w-fit mb-[16px]`}>
                  {exercise.status}
                </div>
                <h3 className="text-[20px] font-bold text-[#191d17] mb-[8px]">
                  {exercise.type}
                </h3>
                <p className="text-[14px] font-medium text-[#42493c] tracking-[0.25px] mb-[24px] flex-1">
                  {exercise.title}
                </p>
                {exercise.progress > 0 && (
                  <div className="mt-auto">
                    <div className="h-[8px] bg-[#f3f4f6] rounded-[4px] overflow-hidden mb-[8px]">
                      <div className="h-full bg-[#205107] rounded-[4px]" style={{ width: `${exercise.progress}%` }} />
                    </div>
                    <span className="text-[12px] font-medium text-[#42493c] tracking-[0.5px]">{exercise.progress}% hoàn thành</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          {/* Recommendations */}
          <div className="bg-white rounded-[28px] p-[32px] shadow-sm flex flex-col gap-[24px]">
            <h3 className="text-[22px] font-bold text-[#191d17]">
              Gợi ý cho bạn
            </h3>
            <div className="flex flex-col gap-[16px]">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-[20px] bg-[#f9fafb] rounded-[20px] cursor-pointer hover:bg-[#ecefe5] transition-colors border border-transparent hover:border-[#d8e7cb]">
                  <div className="text-[16px] font-bold text-[#191d17] mb-[4px]">
                    {rec.title}
                  </div>
                  <div className="text-[14px] font-medium text-[#42493c] tracking-[0.25px]">
                    {rec.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-[28px] p-[32px] shadow-sm flex flex-col gap-[24px]">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-bold text-[#191d17]">
                Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
              </h3>
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="w-[40px] h-[40px] rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} className="text-[#42493c]" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="w-[40px] h-[40px] rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} className="text-[#42493c]" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-[12px] mb-[16px]">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="text-[14px] font-bold text-[#42493c] text-center tracking-[0.5px]">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar days */}
              <div className="flex flex-col gap-[12px]">
                {calendar.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 gap-[12px]">
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return <div key={dayIdx} className="aspect-square" />;
                      }
                      
                      const isCompleted = isCurrentMonth && completedDays.includes(day);
                      const isToday = isCurrentMonth && day === currentDay;
                      
                      return (
                        <div key={dayIdx} className={`aspect-square flex items-center justify-center text-[16px] rounded-full relative cursor-pointer hover:bg-[#f2f5eb] transition-colors
                          ${isToday ? 'font-bold text-white bg-[#205107] hover:bg-[#1a4106]' : isCompleted ? 'font-bold text-[#205107]' : 'font-medium text-[#191d17]'}`}>
                          {day}
                          {isCompleted && !isToday && (
                            <div className="absolute bottom-[4px] w-[6px] h-[6px] rounded-full bg-[#205107]" />
                          )}
                          {isToday && (
                            <div className="absolute inset-[-4px] border-[2px] border-[#205107] rounded-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="mt-auto pt-[24px] border-t border-[#e5e7eb] flex flex-wrap gap-[24px] text-[14px] font-medium text-[#42493c]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[#205107]" />
                <span>Hoàn thành</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <div className="w-[24px] h-[24px] rounded-full bg-[#205107] flex items-center justify-center text-[12px] font-bold text-white">
                  {currentDay}
                </div>
                <span>Hôm nay</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Flame size={18} className="text-[#205107]" />
                <span>Chuỗi hiện tại: 14 ngày</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
