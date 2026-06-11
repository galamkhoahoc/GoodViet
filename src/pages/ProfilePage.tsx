import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Edit3, Save, Shield, Bell, Download, Trash2, Camera, User, Phone, CheckCircle, Clock } from 'lucide-react';
import { practiceApi } from '../services/api/practiceApi';
import { toast } from '../components/common/Toast';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    age: user?.age?.toString() || '',
    phoneNumber: user?.phoneNumber || '',
    targetGoals: user?.targetGoals || '',
  });

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await practiceApi.getHistory();
      setHistory(res.history);
    } catch (err: any) {
      console.warn('Could not load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = () => {
    updateUser({
      fullName: form.fullName,
      age: parseInt(form.age) || user?.age || 30,
      phoneNumber: form.phoneNumber || undefined,
      targetGoals: form.targetGoals,
    });
    setEditing(false);
    toast.success('Thành công', 'Đã cập nhật hồ sơ cá nhân');
  };

  return (
    <div className="w-full min-h-screen bg-[#fdfdf5] font-plus-jakarta pb-20">
      <div className="max-w-[920px] mx-auto pt-12 px-6">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#191d17] mb-2">Account Settings</h1>
          <p className="text-[#42493c]">Manage your profile, preferences, and security settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column - Profile Overview */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-[#e0e4da] p-6 shadow-sm flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-[#d8e7cb] text-[#205107] text-4xl font-bold flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#386a20] rounded-full text-white flex items-center justify-center shadow-md hover:bg-[#2d561a] transition-colors border-2 border-white">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-[#191d17] mb-1">{user?.fullName || 'User'}</h2>
              <p className="text-[#42493c] text-sm mb-6">{user?.email}</p>
              
              <div className="w-full flex gap-2">
                 <div className="flex-1 bg-[#f2f5eb] py-2 rounded-xl border border-[#e0e4da]">
                    <p className="text-xs text-[#42493c] mb-1">Ghi âm</p>
                    <p className="text-lg font-bold text-[#386a20]">{user?.totalRecordings || 0}</p>
                 </div>
                 <div className="flex-1 bg-[#f2f5eb] py-2 rounded-xl border border-[#e0e4da]">
                    <p className="text-xs text-[#42493c] mb-1">Ngày tập</p>
                    <p className="text-lg font-bold text-[#386a20]">{history.length || 0}</p>
                 </div>
              </div>
            </div>

            {/* Quick Stats Card (Activity Summary) */}
            <div className="bg-white rounded-3xl border border-[#e0e4da] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#191d17] mb-4">Hoạt động gần đây</h3>
              <div className="flex flex-col gap-3">
                {history.slice(0, 3).map((session: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f2f5eb] text-[#386a20] flex items-center justify-center shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#191d17]">Tuần {session.week} - Ngày {session.day}</p>
                      <p className="text-xs text-[#42493c] flex items-center gap-1">
                        <Clock size={10} /> {new Date(session.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-[#42493c] text-center py-4">Chưa có dữ liệu luyện tập</p>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column - Settings Details */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Personal Information Form */}
            <div className="bg-white rounded-3xl border border-[#e0e4da] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#191d17] flex items-center gap-2">
                  <User size={20} className="text-[#386a20]" />
                  Thông tin cá nhân
                </h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-bold text-[#386a20] hover:text-[#2d561a]">
                    <Edit3 size={16} /> Chỉnh sửa
                  </button>
                ) : (
                  <button onClick={handleSave} className="flex items-center gap-2 text-sm font-bold bg-[#386a20] text-white px-4 py-1.5 rounded-full hover:bg-[#2d561a]">
                    <Save size={16} /> Lưu
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#42493c] mb-2">Họ và tên</label>
                  {editing ? (
                    <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="w-full bg-[#f2f5eb] border border-[#e0e4da] px-4 py-3 rounded-xl focus:outline-none focus:border-[#386a20] focus:ring-1 focus:ring-[#386a20]" />
                  ) : (
                    <div className="w-full bg-[#fdfdf5] border border-gray-100 px-4 py-3 rounded-xl text-[#191d17]">{user?.fullName || '—'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#42493c] mb-2">Tuổi</label>
                  {editing ? (
                    <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="w-full bg-[#f2f5eb] border border-[#e0e4da] px-4 py-3 rounded-xl focus:outline-none focus:border-[#386a20] focus:ring-1 focus:ring-[#386a20]" />
                  ) : (
                    <div className="w-full bg-[#fdfdf5] border border-gray-100 px-4 py-3 rounded-xl text-[#191d17]">{user?.age || '—'}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#42493c] mb-2">Số điện thoại</label>
                  {editing ? (
                    <input type="text" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} className="w-full bg-[#f2f5eb] border border-[#e0e4da] px-4 py-3 rounded-xl focus:outline-none focus:border-[#386a20] focus:ring-1 focus:ring-[#386a20]" />
                  ) : (
                    <div className="w-full bg-[#fdfdf5] border border-gray-100 px-4 py-3 rounded-xl text-[#191d17]">{user?.phoneNumber || '—'}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#42493c] mb-2">Mục tiêu & Khó khăn</label>
                  {editing ? (
                    <textarea rows={3} value={form.targetGoals} onChange={e => setForm(f => ({ ...f, targetGoals: e.target.value }))} className="w-full bg-[#f2f5eb] border border-[#e0e4da] px-4 py-3 rounded-xl focus:outline-none focus:border-[#386a20] focus:ring-1 focus:ring-[#386a20] resize-none" />
                  ) : (
                    <div className="w-full bg-[#fdfdf5] border border-gray-100 px-4 py-3 rounded-xl text-[#191d17] min-h-[80px]">{user?.targetGoals || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Notifications */}
              <div className="bg-white rounded-3xl border border-[#e0e4da] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#191d17] flex items-center gap-2 mb-6">
                  <Bell size={20} className="text-[#386a20]" />
                  Thông báo
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Nhắc nhở luyện tập', desc: 'Nhận thông báo hàng ngày', enabled: true },
                    { label: 'Cập nhật hệ thống', desc: 'Thông báo về tính năng mới', enabled: true },
                    { label: 'Email báo cáo', desc: 'Báo cáo tiến độ hàng tuần', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-[#191d17]">{item.label}</p>
                        <p className="text-xs text-[#42493c]">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#386a20]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-3xl border border-[#e0e4da] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#191d17] flex items-center gap-2 mb-6">
                  <Shield size={20} className="text-[#386a20]" />
                  Bảo mật
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="bg-[#f2f5eb] p-4 rounded-xl flex items-center justify-between border border-[#e0e4da]">
                    <div>
                      <p className="text-sm font-bold text-[#191d17]">Tải dữ liệu</p>
                      <p className="text-xs text-[#42493c]">Lưu trữ bản sao dữ liệu cá nhân</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#386a20] hover:bg-gray-50">
                      <Download size={14} />
                    </button>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl flex items-center justify-between border border-red-100 mt-auto">
                    <div>
                      <p className="text-sm font-bold text-red-700">Xóa tài khoản</p>
                      <p className="text-xs text-red-600/80">Xóa vĩnh viễn mọi dữ liệu</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-red-600 hover:bg-red-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
