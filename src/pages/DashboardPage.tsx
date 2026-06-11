import { useAuthStore } from '../store/authStore';
import { ArrowRight, CheckCircle, MessageSquare, Users, Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative">
      {/* Top Header - Sticky */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-gray-100 px-10 py-4 flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#191d17] leading-7">Home</h2>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-[#e6e9df] border-0 rounded-full text-sm text-[#42493c] placeholder:text-[#42493c] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-[18px] h-[10px] absolute left-4 top-1/2 -translate-y-1/2 text-[#42493c]" size={18} />
          </div>
          
          {/* Notification Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell size={20} className="text-gray-600" />
          </button>
          
          {/* Settings Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <SettingsIcon size={20} className="text-gray-600" />
          </button>
          
          {/* User Avatar */}
          <div className="ml-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold border-2 border-[#e0e4da]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-10 py-6 pb-24">
        {/* Hero Section */}
        <section className="relative h-[500px] rounded-[28px] overflow-hidden mb-20 bg-[#e6e9df]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200"
              alt="Vietnamese landscape"
              className="w-full h-full object-cover mix-blend-multiply opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/0"></div>
          </div>

          <div className="relative h-full flex flex-col justify-center px-12 max-w-[672px]">
            <h1 className="text-[57px] font-normal leading-[64px] text-[#191d17] mb-6 tracking-[-0.25px]">
              Luyện Phát Âm Tiếng<br />
              Việt<br />
              <span className="text-[#205107]">Chuẩn Xác Với AI.</span>
            </h1>
            <p className="text-[#42493c] text-base leading-6 mb-8 max-w-[576px] tracking-[0.5px]">
              Nâng tầm giọng nói, tự tin giao tiếp. GOODVIET giúp người trưởng thành
              khắc phục các lỗi phát âm (L/N, TR/CH, S/X) thông qua công nghệ phân
              tích giọng nói tiên tiến.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/assessment')}
                className="bg-[#205107] text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-[#1a4106] transition-colors shadow-md text-[14px] tracking-[0.1px] leading-5"
              >
                Bắt đầu đánh giá ngay
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => navigate('/pathway')}
                className="bg-[#d8e7cb] text-[#596750] px-8 py-4 rounded-full font-medium hover:bg-[#c8d7bb] transition-colors text-[14px] tracking-[0.1px] leading-5"
              >
                Tìm hiểu lộ trình
              </button>
            </div>
          </div>
        </section>

        {/* Featured Collections - Bento Grid */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[32px] font-bold text-[#191d17] mb-2 leading-10">Cốt Lõi Nền Tảng</h2>
              <p className="text-[#42493c] text-[14px] leading-5 tracking-[0.25px]">Giải pháp toàn diện cho việc luyện phát âm.</p>
            </div>
            <button className="text-[#205107] font-medium text-[14px] flex items-center gap-2 hover:underline tracking-[0.1px] leading-5">
              Xem tất cả
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Large Card - Assessment */}
            <div
              onClick={() => navigate('/assessment')}
              className="col-span-8 h-[280px] bg-[#ecefe5] rounded-[28px] overflow-hidden relative cursor-pointer hover:shadow-lg transition-all border border-[rgba(224,228,218,0.3)]"
            >
              <div className="absolute inset-0 bg-[#386a20]/10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="bg-[#386a20] px-4 py-1 rounded-full text-[#aee88f] text-[12px] font-medium inline-block w-fit mb-2 tracking-[0.5px] leading-4">
                  Assessment
                </div>
                <h3 className="text-[28px] font-bold text-white mb-2 leading-9">Đánh giá giọng nói AI</h3>
                <p className="text-[#e6e9df] text-[14px] max-w-md tracking-[0.25px] leading-5">
                  Hệ thống sàng lọc 3 giai đoạn giúp chẩn đoán chính xác các vấn đề phát âm.
                </p>
              </div>
            </div>

            {/* Tall Card - Practice */}
            <div
              onClick={() => navigate('/pathway')}
              className="col-span-4 row-span-2 h-[584px] bg-[#ecefe5] rounded-[28px] overflow-hidden relative cursor-pointer hover:shadow-lg transition-all border border-[rgba(224,228,218,0.3)]"
            >
              <div className="absolute inset-0 bg-[#d8e7cb]/10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              <div className="relative h-full flex flex-col justify-end p-6">
                <div className="bg-[#386666] px-3 py-1 rounded-full text-[#b2e2e1] text-[12px] font-medium inline-block w-fit mb-2 tracking-[0.5px] leading-4">
                  Practice
                </div>
                <h3 className="text-[22px] font-bold text-white mb-2 leading-7">Lộ trình cá nhân hóa</h3>
                <p className="text-[#e6e9df] text-[14px] tracking-[0.25px] leading-5">
                  Các bài tập được thiết kế riêng biệt cho từng người dùng trong 1-1.5 tháng.
                </p>
              </div>
            </div>

            {/* Small Card - Chat AI */}
            <div
              onClick={() => navigate('/chat')}
              className="col-span-4 h-[280px] bg-[#ecefe5] rounded-[28px] p-[25px] flex flex-col cursor-pointer hover:shadow-lg transition-all border border-[rgba(224,228,218,0.3)]"
            >
              <div className="w-12 h-12 bg-[#d8e7cb] rounded-full flex items-center justify-center mb-auto">
                <MessageSquare className="text-[#386a20]" size={22} />
              </div>
              <div className="mt-auto">
                <h3 className="text-[22px] font-bold text-[#191d17] mb-2 leading-7">Trò chuyện cùng AI</h3>
                <p className="text-[#42493c] text-[14px] mb-4 tracking-[0.25px] leading-5">
                  Trợ lý GoodBot luôn sẵn sàng hỗ trợ, động viên và giải đáp thắc mắc.
                </p>
                <div className="flex items-center text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-4">
                  Trò chuyện
                  <ArrowRight className="ml-1" size={11} />
                </div>
              </div>
            </div>

            {/* Small Card - Experts */}
            <div
              onClick={() => navigate('/experts')}
              className="col-span-4 h-[280px] bg-[#ecefe5] rounded-[28px] p-[25px] flex flex-col cursor-pointer hover:shadow-lg transition-all border border-[rgba(224,228,218,0.3)]"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-auto">
                <Users className="text-[#386a20]" size={22} />
              </div>
              <div className="mt-auto">
                <h3 className="text-[22px] font-bold text-[#191d17] mb-2 leading-7">Kết nối chuyên gia</h3>
                <p className="text-[#42493c] text-[14px] mb-4 tracking-[0.25px] leading-5">
                  Đặt lịch tư vấn 1:1 trực tiếp với các chuyên gia ngôn ngữ trị liệu hàng đầu.
                </p>
                <div className="flex items-center text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-4">
                  Tìm hiểu thêm
                  <ArrowRight className="ml-1" size={11} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="bg-[#f2f5eb] rounded-[28px] p-12 border border-[rgba(224,228,218,0.4)] flex gap-10 items-center mb-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#386a20]/20 rounded-full blur-[32px]"></div>

          <div className="flex-1 relative z-10">
            <div className="bg-white px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm mb-4">
              <CheckCircle size={13} className="text-[#205107]" />
              <span className="text-[#205107] text-[12px] font-medium tracking-[0.5px] leading-4">Hiệu Quả Cao Nhất</span>
            </div>

            <h2 className="text-[32px] font-bold text-[#191d17] mb-4 leading-10">
              Giải Pháp Toàn Diện<br />Cho Giọng Nói
            </h2>

            <p className="text-[#42493c] text-base mb-6 leading-6 tracking-[0.5px]">
              GOODVIET kết hợp giữa trí tuệ nhân tạo và chuyên môn
              lâm sàng để mang lại hiệu quả cao nhất.
            </p>

            <ul className="space-y-4 mb-8 py-4">
              <li className="flex items-center gap-3">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] leading-6">Công nghệ AI phân tích từng âm tiết (phoneme).</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] leading-6">Hỗ trợ luyện tập offline và đồng bộ tự động.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-[#386a20] shrink-0" size={20} />
                <span className="text-[#191d17] leading-6">Theo dõi tiến độ và streak hàng ngày.</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/assessment')}
              className="bg-white border-2 border-[#72796b] text-[#205107] px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors text-[14px] tracking-[0.1px] leading-5"
            >
              Bắt Đầu Ngay
            </button>
          </div>

          <div className="flex-1 relative z-10">
            <div className="w-full h-[450px] bg-gradient-to-br from-gray-200 to-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544717684-3f9c12542e01?w=600"
                alt="Professional"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#f2f5eb] border-t border-[rgba(224,228,218,0.3)] -mx-10 px-10 py-10 mt-8">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-[22px] font-bold text-[#205107] mb-4 leading-7">GoodViet</h3>
              <p className="text-[#42493c] text-[14px] tracking-[0.25px] leading-5">
                Nền tảng luyện phát âm Tiếng Việt
                chuẩn xác với sự hỗ trợ của AI.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#191d17] text-[14px] mb-3 tracking-[0.1px] leading-5">Platform</h4>
              <ul className="space-y-3 text-[#42493c] text-[14px] tracking-[0.25px] leading-5">
                <li><button onClick={() => navigate('/dashboard')} className="hover:text-gray-900">Dashboard</button></li>
                <li><button onClick={() => navigate('/assessment')} className="hover:text-gray-900">Assessment</button></li>
                <li><button onClick={() => navigate('/experts')} className="hover:text-gray-900">Experts</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#191d17] text-[14px] mb-3 tracking-[0.1px] leading-5">Hỗ Trợ</h4>
              <ul className="space-y-3 text-[#42493c] text-[14px] tracking-[0.25px] leading-5">
                <li className="hover:text-gray-900 cursor-pointer">Contact Support</li>
                <li className="hover:text-gray-900 cursor-pointer">Terms of Service</li>
                <li className="hover:text-gray-900 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>

            <div className="text-right">
              <div className="flex justify-end gap-3 mb-6">
                <div className="w-10 h-10 bg-white border border-[#e0e4da] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <svg className="w-[11.67px] h-[9.33px] text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-white border border-[#e0e4da] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <svg className="w-[10.5px] h-[11.67px] text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </div>
              </div>
              <p className="text-[12px] text-[#42493c] text-right leading-4">
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
