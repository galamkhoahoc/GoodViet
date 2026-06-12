import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Camera, Mail, Phone, MapPin, Globe, Bell, Shield, Key, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.fullName?.split(' ')[0] || 'Văn A',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || 'Nguyễn',
    bio: 'Đam mê bảo tồn di sản văn hóa Việt Nam và khám phá các diễn giải hiện đại về thủ công mỹ nghệ truyền thống.',
  });

  const [emailDigests, setEmailDigests] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="bg-white relative min-h-full flex flex-col font-plus-jakarta">
      
      {/* Top Header - Sticky for consistency with Dashboard */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-gray-100 px-[40px] py-[16px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[16px]">
          <button 
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full bg-[#ecefe5] flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#42493c]" />
          </button>
          <h2 className="text-[22px] font-bold text-[#191d17] leading-7">Hồ sơ cá nhân</h2>
        </div>
        
        <div className="flex items-center gap-[12px]">
          <div className="w-[40px] h-[40px] rounded-[9999px] bg-[#386a20] flex items-center justify-center text-white font-bold border-2 border-[#e0e4da] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-[40px] py-[32px] pb-[96px] flex flex-col gap-[32px] max-w-[1280px] mx-auto w-full">
        
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] font-bold text-[#191d17] leading-[40px]">Cài đặt tài khoản</h1>
          <p className="text-[#42493c] text-[14px] leading-[20px] tracking-[0.25px]">
            Quản lý hồ sơ, tùy chọn và cài đặt bảo mật của bạn.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] w-full">
          
          {/* Left Column - Profile Overview */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-[24px]">
            
            {/* User Profile Card */}
            <div className="bg-[#ecefe5] border border-[rgba(224,228,218,0.3)] rounded-[28px] overflow-hidden relative shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] group">
              <div className="h-[120px] bg-gradient-to-r from-[#d8e7cb] to-[#b8f398] opacity-80 relative">
                {/* Decorative background elements */}
                <div className="absolute right-[-20px] top-[-20px] w-[100px] h-[100px] bg-white/20 rounded-full blur-[10px]"></div>
              </div>
              
              <div className="px-[32px] pb-[32px] relative flex flex-col items-center mt-[-56px]">
                {/* Avatar */}
                <div className="relative mb-[16px]">
                  <div className="w-[112px] h-[112px] rounded-full bg-white border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-[#386a20] flex items-center justify-center text-white text-[40px] font-bold">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-[#b8f398] rounded-full flex items-center justify-center shadow-md hover:bg-[#a2db84] transition-colors border-2 border-white">
                    <Camera size={14} className="text-[#205107]" />
                  </button>
                </div>

                <h3 className="text-[24px] font-bold text-[#191d17] leading-[32px] mb-[4px] text-center">
                  {user?.fullName || 'Người dùng'}
                </h3>
                <p className="text-[14px] text-[#42493c] tracking-[0.25px] mb-[24px] text-center">
                  Thành viên từ {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </p>

                <div className="flex justify-center gap-[8px] w-full mb-[24px]">
                  <span className="px-[12px] py-[4px] bg-[#386666] text-white text-[12px] font-medium rounded-full tracking-[0.5px]">
                    Học viên tích cực
                  </span>
                  <span className="px-[12px] py-[4px] bg-[#d8e7cb] text-[#205107] text-[12px] font-medium rounded-full tracking-[0.5px]">
                    Premium
                  </span>
                </div>

                <div className="w-full border-t border-[rgba(224,228,218,0.8)] pt-[24px] flex flex-col gap-[16px]">
                  <div className="flex items-center gap-[12px] text-[14px] text-[#42493c] tracking-[0.25px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Mail size={16} className="text-[#386a20]" />
                    </div>
                    <span className="truncate flex-1">{user?.email || 'chua.cap.nhat@email.com'}</span>
                  </div>
                  <div className="flex items-center gap-[12px] text-[14px] text-[#42493c] tracking-[0.25px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Phone size={16} className="text-[#386a20]" />
                    </div>
                    <span className="flex-1">{user?.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-[12px] text-[14px] text-[#42493c] tracking-[0.25px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin size={16} className="text-[#386a20]" />
                    </div>
                    <span className="flex-1">Việt Nam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary Card */}
            <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] p-[32px]">
              <h4 className="text-[18px] font-bold text-[#191d17] leading-[24px] mb-[24px]">Thống kê hoạt động</h4>
              <div className="grid grid-cols-2 gap-[16px]">
                <div className="bg-[#ecefe5] rounded-[20px] p-[20px] flex flex-col items-center justify-center hover:bg-[#d8e7cb] transition-colors cursor-pointer text-center">
                  <p className="text-[32px] font-bold text-[#205107] leading-[40px] mb-[4px]">{user?.totalRecordings || 0}</p>
                  <p className="text-[12px] font-medium text-[#42493c] tracking-[0.5px]">Bản thu âm</p>
                </div>
                <div className="bg-[#ecefe5] rounded-[20px] p-[20px] flex flex-col items-center justify-center hover:bg-[#d8e7cb] transition-colors cursor-pointer text-center">
                  <p className="text-[32px] font-bold text-[#205107] leading-[40px] mb-[4px]">{user?.currentStreak || 0}</p>
                  <p className="text-[12px] font-medium text-[#42493c] tracking-[0.5px]">Chuỗi ngày học</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Details */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-[24px]">
            
            {/* Personal Information Form */}
            <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] p-[32px]">
              <div className="flex items-center justify-between mb-[24px]">
                <h3 className="text-[22px] font-bold text-[#191d17] leading-[28px]">Thông tin cá nhân</h3>
                <button 
                  onClick={() => setEditing(!editing)}
                  className="px-[20px] py-[8px] rounded-full bg-[#f2f5eb] text-[#205107] text-[14px] font-medium hover:bg-[#d8e7cb] transition-colors tracking-[0.1px]"
                >
                  {editing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#42493c] tracking-[0.25px] pl-[16px]">
                    Họ
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-[#ecefe5] px-[24px] py-[16px] rounded-[9999px] text-[#191d17] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#386a20] disabled:opacity-70 transition-all border-none"
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#42493c] tracking-[0.25px] pl-[16px]">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-[#ecefe5] px-[24px] py-[16px] rounded-[9999px] text-[#191d17] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#386a20] disabled:opacity-70 transition-all border-none"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#42493c] tracking-[0.25px] pl-[16px]">
                    Giới thiệu ngắn
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({...form, bio: e.target.value})}
                    disabled={!editing}
                    rows={4}
                    className="w-full bg-[#ecefe5] px-[24px] py-[20px] rounded-[28px] text-[#191d17] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#386a20] resize-none disabled:opacity-70 transition-all border-none leading-[24px]"
                  />
                </div>
              </div>
            </div>

            {/* Preferences Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              
              {/* Language & Region */}
              <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] p-[32px] flex flex-col gap-[24px]">
                <div className="flex items-center gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#d8e7cb] rounded-full flex items-center justify-center shrink-0">
                    <Globe size={24} className="text-[#205107]" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#191d17] leading-[28px]">
                    Ngôn ngữ &<br/>Khu vực
                  </h3>
                </div>

                <div className="flex flex-col gap-[16px] flex-1">
                  <div className="bg-[#ecefe5] rounded-[24px] p-[20px] flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-[#42493c] mb-[4px]">Ngôn ngữ hiển thị</p>
                      <p className="text-[16px] font-bold text-[#191d17]">Tiếng Việt</p>
                    </div>
                    <button className="text-[14px] font-medium text-[#205107] hover:underline">Thay đổi</button>
                  </div>

                  <div className="bg-[#ecefe5] rounded-[24px] p-[20px]">
                    <p className="text-[14px] font-medium text-[#42493c] mb-[4px]">Múi giờ</p>
                    <p className="text-[16px] font-bold text-[#191d17]">Indochina Time (ICT)</p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] p-[32px] flex flex-col gap-[24px]">
                <div className="flex items-center gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#386666] rounded-full flex items-center justify-center shrink-0">
                    <Bell size={24} className="text-white" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#191d17] leading-[28px]">Thông báo</h3>
                </div>

                <div className="flex flex-col gap-[24px] flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[16px] font-bold text-[#191d17] mb-[4px]">Email định kỳ</p>
                      <p className="text-[14px] text-[#42493c]">Báo cáo kết quả tuần</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailDigests}
                        onChange={e => setEmailDigests(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#386a20] relative transition-colors shadow-inner">
                        <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-[24px] w-[24px] transition-transform peer-checked:translate-x-[24px] shadow-sm"></div>
                      </div>
                    </label>
                  </div>

                  <div className="w-full h-[1px] bg-[rgba(224,228,218,0.5)]"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[16px] font-bold text-[#191d17] mb-[4px]">Thông báo đẩy</p>
                      <p className="text-[14px] text-[#42493c]">Nhắc nhở luyện tập</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushNotifications}
                        onChange={e => setPushNotifications(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#386a20] relative transition-colors shadow-inner">
                        <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-[24px] w-[24px] transition-transform peer-checked:translate-x-[24px] shadow-sm"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] p-[32px]">
              <div className="flex items-center gap-[16px] mb-[24px]">
                <div className="w-[48px] h-[48px] bg-[#ffdad6] rounded-full flex items-center justify-center shrink-0">
                  <Shield size={24} className="text-[#ba1a1a]" />
                </div>
                <h3 className="text-[22px] font-bold text-[#191d17] leading-[28px]">Bảo mật tài khoản</h3>
              </div>

              <div className="flex flex-col gap-[16px]">
                <div className="bg-[#ecefe5] rounded-[24px] p-[24px] flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <Key size={20} className="text-[#386a20]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-[#191d17] mb-[4px]">Mật khẩu</p>
                      <p className="text-[14px] text-[#42493c]">Cập nhật lần cuối 3 tháng trước</p>
                    </div>
                  </div>
                  <button className="bg-white border border-[rgba(224,228,218,0.8)] px-[24px] py-[12px] rounded-[9999px] text-[14px] font-bold text-[#191d17] hover:bg-gray-50 transition-colors shadow-sm">
                    Đổi mật khẩu
                  </button>
                </div>

                <div className="bg-[#ecefe5] rounded-[24px] p-[24px] flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone size={20} className="text-[#386a20]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-[#191d17] mb-[4px]">Xác thực 2 bước (2FA)</p>
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[8px] h-[8px] bg-[#205107] rounded-full"></div>
                        <p className="text-[14px] text-[#205107] font-medium">Đang bật</p>
                      </div>
                    </div>
                  </div>
                  <button className="bg-white border border-[rgba(224,228,218,0.8)] px-[24px] py-[12px] rounded-[9999px] text-[14px] font-bold text-[#191d17] hover:bg-gray-50 transition-colors shadow-sm">
                    Quản lý
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-[16px] pt-[16px]">
              <button 
                className="px-[32px] py-[16px] rounded-[9999px] text-[14px] font-bold text-[#42493c] hover:bg-gray-100 transition-colors"
                onClick={() => setEditing(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="bg-[#205107] text-white px-[32px] py-[16px] rounded-[9999px] text-[14px] font-bold shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-[#1a4106] transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
