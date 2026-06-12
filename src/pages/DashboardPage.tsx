import { useAuthStore } from '../store/authStore';
import { ArrowRight, CheckCircle, Search, Bell, Settings as SettingsIcon, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  return (
    <div className="bg-white relative min-h-full flex flex-col font-plus-jakarta">
      {/* Top Header - Sticky */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-gray-100 px-[40px] py-[16px] flex items-center justify-between shrink-0">
        <h2 className="text-[22px] font-bold text-[#191d17] leading-7">Home</h2>
        
        <div className="flex items-center gap-[12px]">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-[40px] pr-[16px] py-[8px] bg-[#e6e9df] border-0 rounded-[9999px] text-[14px] text-[#42493c] placeholder:text-[#42493c] focus:outline-none focus:ring-2 focus:ring-[#386a20]"
            />
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#42493c]" size={18} />
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-[9999px]">
            <Bell size={20} className="text-[#42493c]" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-[9999px]">
            <SettingsIcon size={20} className="text-[#42493c]" />
          </button>
          
          <div className="ml-2 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="w-[40px] h-[40px] rounded-[9999px] bg-[#386a20] flex items-center justify-center text-white font-bold border-2 border-[#e0e4da] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-[40px] py-[24px] pb-[96px] flex flex-col gap-[80px] max-w-[1280px] mx-auto w-full">
        
        {/* Hero Section */}
        <section className="bg-[#e6e9df] rounded-[28px] h-[500px] relative overflow-hidden flex items-center shrink-0 w-full shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200"
              alt="Vietnamese landscape"
              className="w-full h-full object-cover mix-blend-multiply opacity-80 scale-105 transform translate-y-[-10%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.95)] via-[rgba(255,255,255,0.7)] to-[rgba(255,255,255,0)]"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-[24px] pl-[48px] pr-[32px] max-w-[672px]">
            <h1 className="text-[48px] lg:text-[57px] font-normal leading-tight lg:leading-[64px] text-[#191d17] tracking-[-0.25px]">
              Luyện Phát Âm Tiếng<br />
              Việt<br />
              <span className="text-[#205107]">Chuẩn Xác Với AI.</span>
            </h1>
            <p className="text-[#42493c] text-[16px] leading-[24px] max-w-[576px] tracking-[0.5px]">
              Nâng tầm giọng nói, tự tin giao tiếp. GOODVIET giúp người trưởng thành
              khắc phục các lỗi phát âm (L/N, TR/CH, S/X) thông qua công nghệ phân
              tích giọng nói tiên tiến.
            </p>
            <div className="flex gap-[16px] pt-[16px]">
              <button
                onClick={() => navigate('/assessment')}
                className="bg-[#205107] text-white px-[32px] py-[16px] rounded-[9999px] font-medium flex items-center gap-[8px] hover:bg-[#1a4106] transition-colors shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] text-[14px] tracking-[0.1px] leading-[20px]"
              >
                Bắt đầu đánh giá ngay
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/pathway')}
                className="bg-[#d8e7cb] text-[#596750] px-[32px] py-[16px] rounded-[9999px] font-medium hover:bg-[#c8d7bb] transition-colors text-[14px] tracking-[0.1px] leading-[20px]"
              >
                Tìm hiểu lộ trình
              </button>
            </div>
          </div>
        </section>

        {/* Featured Collections - Bento Grid */}
        <section className="flex flex-col gap-[40px] w-full shrink-0">
          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[32px] font-bold text-[#191d17] leading-[40px]">Cốt Lõi Nền Tảng</h2>
              <p className="text-[#42493c] text-[14px] leading-[20px] tracking-[0.25px]">Giải pháp toàn diện cho việc luyện phát âm.</p>
            </div>
            <button className="text-[#205107] font-medium text-[14px] flex items-center gap-[8px] hover:underline tracking-[0.1px] leading-[20px]">
              Xem tất cả
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[280px_280px] gap-[24px] h-auto md:h-[584px] w-full">
            {/* Large Card - Assessment */}
            <div
              onClick={() => navigate('/assessment')}
              className="col-span-1 md:col-span-8 row-span-1 h-[280px] bg-[#ecefe5] border border-[rgba(224,228,218,0.3)] rounded-[28px] overflow-hidden relative cursor-pointer hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] transition-all group"
            >
              <div className="absolute inset-0 bg-[rgba(56,106,32,0.1)] transition-opacity group-hover:opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,29,23,0.8)] via-[rgba(25,29,23,0)] to-[rgba(25,29,23,0)] via-50%"></div>
              <div className="absolute bottom-0 left-0 right-0 p-[32px] flex flex-col gap-[8px]">
                <div className="bg-[#386a20] px-[16px] py-[4px] rounded-[9999px] inline-flex w-fit">
                  <span className="text-[#aee88f] text-[12px] font-medium tracking-[0.5px] leading-[16px]">Assessment</span>
                </div>
                <h3 className="text-[28px] font-bold text-white leading-[36px] mt-1">Đánh giá giọng nói AI</h3>
                <p className="text-[#e6e9df] text-[14px] tracking-[0.25px] leading-[20px] max-w-[448px]">
                  Hệ thống sàng lọc 3 giai đoạn giúp chẩn đoán chính xác các vấn đề phát âm.
                </p>
              </div>
            </div>

            {/* Tall Card - Practice */}
            <div
              onClick={() => navigate('/pathway')}
              className="col-span-1 md:col-span-4 row-span-1 md:row-span-2 h-[280px] md:h-full bg-[#ecefe5] border border-[rgba(224,228,218,0.3)] rounded-[28px] overflow-hidden relative cursor-pointer hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] transition-all group"
            >
              <div className="absolute inset-0 bg-[rgba(216,231,203,0.1)] transition-opacity group-hover:opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,29,23,0.8)] via-[rgba(25,29,23,0)] to-[rgba(25,29,23,0)] via-50%"></div>
              <div className="absolute bottom-0 left-0 right-0 p-[24px] flex flex-col gap-[8px]">
                <div className="bg-[#386666] px-[12px] py-[4px] rounded-[9999px] inline-flex w-fit">
                  <span className="text-[#b2e2e1] text-[12px] font-medium tracking-[0.5px] leading-[16px]">Practice</span>
                </div>
                <h3 className="text-[22px] font-bold text-white leading-[28px] mt-1">Lộ trình cá nhân hóa</h3>
                <p className="text-[#e6e9df] text-[14px] tracking-[0.25px] leading-[20px]">
                  Các bài tập được thiết kế riêng biệt cho từng người dùng trong 1-1.5 tháng.
                </p>
              </div>
            </div>

            {/* Small Card 2 - Chat AI */}
            <div
              onClick={() => navigate('/chat')}
              className="col-span-1 md:col-span-4 row-span-1 h-[280px] bg-[#ecefe5] border border-[rgba(224,228,218,0.3)] rounded-[28px] p-[25px] flex flex-col cursor-pointer hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] transition-all group"
            >
              <div className="w-[48px] h-[48px] bg-[#d8e7cb] rounded-[9999px] flex items-center justify-center mb-auto group-hover:scale-110 transition-transform">
                <MessageSquare className="text-[#205107]" size={22} />
              </div>
              <div className="mt-auto flex flex-col pt-[50px] pb-[8px]">
                <h3 className="text-[22px] font-bold text-[#191d17] leading-[28px] mb-2">Trò chuyện cùng AI</h3>
                <p className="text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] mb-4">
                  Trợ lý GoodBot luôn sẵn sàng hỗ trợ, động viên và giải đáp thắc mắc.
                </p>
                <div className="flex items-center gap-[4px] text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-[16px]">
                  Trò chuyện
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Small Card 3 - Experts */}
            <div
              onClick={() => navigate('/experts')}
              className="col-span-1 md:col-span-4 row-span-1 h-[280px] bg-[#ecefe5] border border-[rgba(224,228,218,0.3)] rounded-[28px] p-[25px] flex flex-col cursor-pointer hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] transition-all group"
            >
              <div className="w-[48px] h-[48px] bg-white rounded-[9999px] flex items-center justify-center mb-auto group-hover:scale-110 transition-transform">
                <Users className="text-[#205107]" size={22} />
              </div>
              <div className="mt-auto flex flex-col pt-[50px] pb-[8px]">
                <h3 className="text-[22px] font-bold text-[#191d17] leading-[28px] mb-2">Kết nối chuyên gia</h3>
                <p className="text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] mb-4">
                  Đặt lịch tư vấn 1:1 trực tiếp với các chuyên gia ngôn ngữ trị liệu hàng đầu.
                </p>
                <div className="flex items-center gap-[4px] text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-[16px]">
                  Tìm hiểu thêm
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Heritage Asymmetric Section */}
        <section className="bg-[#f2f5eb] border border-[rgba(224,228,218,0.4)] rounded-[28px] p-[49px] flex flex-col lg:flex-row gap-[40px] items-center relative overflow-hidden shrink-0 w-full shadow-sm">
          <div className="absolute right-[-96px] top-[-96px] w-[384px] h-[384px] bg-[rgba(56,106,32,0.2)] rounded-[9999px] blur-[32px] z-0"></div>

          <div className="flex-1 relative z-10 flex flex-col gap-[16px]">
            <div className="bg-white px-[16px] py-[8px] rounded-[9999px] inline-flex items-center gap-[8px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] w-fit">
              <CheckCircle size={14} className="text-[#205107]" />
              <span className="text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-[16px]">Hiệu Quả Cao Nhất</span>
            </div>

            <h2 className="text-[32px] font-bold text-[#191d17] leading-[40px] pt-[8px]">
              Giải Pháp Toàn Diện Cho<br />Giọng Nói
            </h2>

            <p className="text-[#42493c] text-[16px] leading-[24px] tracking-[0.5px] max-w-[512px]">
              GOODVIET kết hợp giữa trí tuệ nhân tạo và chuyên môn
              lâm sàng để mang lại hiệu quả cao nhất.
            </p>

            <ul className="flex flex-col gap-[15.5px] py-[16px]">
              <li className="flex items-center gap-[12px]">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] text-[16px] leading-[24px]">Công nghệ AI phân tích từng âm tiết (phoneme).</span>
              </li>
              <li className="flex items-center gap-[12px]">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] text-[16px] leading-[24px]">Hỗ trợ luyện tập offline và đồng bộ tự động.</span>
              </li>
              <li className="flex items-center gap-[12px]">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] text-[16px] leading-[24px]">Theo dõi tiến độ và streak hàng ngày.</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/assessment')}
              className="bg-white border border-[#72796b] text-[#205107] px-[33px] py-[13px] rounded-[9999px] font-medium hover:bg-gray-50 transition-colors text-[14px] tracking-[0.1px] leading-[20px] w-fit"
            >
              Bắt Đầu Ngay
            </button>
          </div>

          <div className="flex-1 h-[450px] relative z-10 w-full min-w-0">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544717684-3f9c12542e01?w=600"
                alt="Professional"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Footer inside Main Area */}
      <div className="pt-[32px] shrink-0 w-full">
        <footer className="bg-[#f2f5eb] border-t border-[rgba(224,228,218,0.3)] px-[40px] pt-[41px] pb-[40px] w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[32px]">
            <div className="col-span-1 md:col-span-1 flex flex-col gap-[16px] pb-[36px]">
              <h3 className="text-[22px] font-bold text-[#205107] leading-[28px]">GoodViet</h3>
              <p className="text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] max-w-[320px]">
                Nền tảng luyện phát âm Tiếng Việt
                chuẩn xác với sự hỗ trợ của AI.
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-[32px]">
              <div className="flex flex-col gap-[12px]">
                <h4 className="font-bold text-[#191d17] text-[14px] tracking-[0.1px] leading-[20px] pb-[4px]">Platform</h4>
                <button onClick={() => navigate('/dashboard')} className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Dashboard</button>
                <button onClick={() => navigate('/assessment')} className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Assessment</button>
                <button onClick={() => navigate('/experts')} className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Experts</button>
              </div>

              <div className="flex flex-col gap-[12px]">
                <h4 className="font-bold text-[#191d17] text-[14px] tracking-[0.1px] leading-[20px] pb-[4px]">Hỗ Trợ</h4>
                <button className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Contact Support</button>
                <button className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Terms of Service</button>
                <button className="text-left text-[#42493c] text-[14px] tracking-[0.25px] leading-[20px] hover:text-[#191d17] transition-colors">Privacy Policy</button>
              </div>
            </div>

            <div className="col-span-1 flex flex-col items-end gap-[12px]">
              <div className="flex gap-[16px] pb-[8px]">
                <button className="w-[32px] h-[32px] rounded-full border border-[rgba(224,228,218,0.5)] bg-white flex items-center justify-center hover:bg-gray-50 text-[#191d17]">
                  <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </button>
                <button className="w-[32px] h-[32px] rounded-full border border-[rgba(224,228,218,0.5)] bg-white flex items-center justify-center hover:bg-gray-50 text-[#191d17]">
                  <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </button>
              </div>
              <p className="text-[12px] text-[#42493c] text-right leading-[16px]">
                © 2024 GoodViet Speech<br />
                Therapy Platform.<br />
                All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
