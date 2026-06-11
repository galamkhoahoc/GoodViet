import { useAuthStore } from '../store/authStore';
import { Mic, Bot, Users, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Hero Section */}
        <section className="relative h-[500px] rounded-[32px] overflow-hidden mb-16 shadow-2xl">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-12 max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Nền Tảng Luyện Phát Âm Tiếng Việt
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Cải thiện kỹ năng phát âm của bạn với công nghệ AI tiên tiến và hướng dẫn từ chuyên gia
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/assessment')}
                className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
              >
                Bắt đầu đánh giá
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/pathway')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-all"
              >
                Xem lộ trình
              </button>
            </div>
          </div>
        </section>

        {/* Featured Collections - Bento Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Các Tính Năng Nổi Bật</h2>
              <p className="text-gray-600">Khám phá những công cụ hỗ trợ học tập hiệu quả</p>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Xem tất cả
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Large Card - AI Assessment */}
            <div 
              onClick={() => navigate('/assessment')}
              className="col-span-2 h-[280px] relative rounded-3xl overflow-hidden cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 w-fit">
                  Phổ biến
                </div>
                <h3 className="text-4xl font-bold text-white mb-3">Đánh giá giọng nói AI</h3>
                <p className="text-white/90 text-lg max-w-md">
                  Phân tích chính xác phát âm với công nghệ trí tuệ nhân tạo tiên tiến
                </p>
              </div>
            </div>

            {/* Tall Card - Personalized Path */}
            <div 
              onClick={() => navigate('/pathway')}
              className="row-span-2 h-[584px] relative rounded-3xl overflow-hidden cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative h-full flex flex-col justify-end p-6">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3 w-fit">
                  Cá nhân hóa
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Lộ trình cá nhân hóa</h3>
                <p className="text-white/90">
                  Các bài tập được thiết kế riêng biệt cho từng người dùng trong 1-1.5 tháng.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row - Small Cards */}
          <div className="grid grid-cols-3 gap-6">
            {/* Chat AI */}
            <div 
              onClick={() => navigate('/chat')}
              className="h-[280px] bg-white rounded-3xl p-6 cursor-pointer hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-16">Trò chuyện cùng AI</h3>
              <p className="text-gray-600 mb-4">
                Trợ lý GoodBot luôn sẵn sàng hỗ trợ, động viên và giải đáp thắc mắc.
              </p>
              <div className="flex items-center text-emerald-600 font-medium">
                Bắt đầu chat
                <ArrowRight className="ml-1" size={14} />
              </div>
            </div>

            {/* Expert Connection */}
            <div 
              onClick={() => navigate('/experts')}
              className="h-[280px] bg-white rounded-3xl p-6 cursor-pointer hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-16">Kết nối chuyên gia</h3>
              <p className="text-gray-600 mb-4">
                Đặt lịch tư vấn 1:1 trực tiếp với các chuyên gia ngôn ngữ trị liệu hàng đầu.
              </p>
              <div className="flex items-center text-emerald-600 font-medium">
                Tìm chuyên gia
                <ArrowRight className="ml-1" size={14} />
              </div>
            </div>

            {/* Additional Feature */}
            <div className="h-[280px] bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="text-teal-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-16">Theo dõi tiến độ</h3>
              <p className="text-gray-600">
                Xem chi tiết thống kê và tiến bộ của bạn qua từng buổi luyện tập.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="bg-white rounded-3xl p-12 border border-gray-100 flex gap-12 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <CheckCircle size={16} />
              Giải pháp hiệu quả
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Giải Pháp Toàn Diện Cho Giọng Nói
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              GOODVIET kết hợp giữa trí tuệ nhân tạo và chuyên môn lâm sàng để mang lại hiệu quả cao nhất.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Đánh giá giọng nói tự động với độ chính xác cao</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Lộ trình luyện tập cá nhân hóa phù hợp với từng người</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Hỗ trợ từ chuyên gia ngôn ngữ trị liệu giàu kinh nghiệm</span>
              </li>
            </ul>
            <button 
              onClick={() => navigate('/assessment')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              Tìm hiểu thêm
            </button>
          </div>
          <div className="flex-1">
            <div className="w-full h-[450px] bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl"></div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">GoodViet</h3>
              <p className="text-gray-600 text-sm">
                Nền tảng luyện phát âm Tiếng Việt chuẩn xác với sự hỗ trợ của AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><button onClick={() => navigate('/dashboard')}>Dashboard</button></li>
                <li><button onClick={() => navigate('/assessment')}>Assessment</button></li>
                <li><button onClick={() => navigate('/experts')}>Experts</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Contact Support</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-4">© 2024 GoodViet. Một dự án của Phú Quý & TCG Science.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
