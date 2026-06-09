import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Calendar, Edit3, Save, Shield, Bell, Download, Trash2 } from 'lucide-react';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    phone: user?.phone || '',
    speechDescription: user?.speechDescription || '',
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile');

  const handleSave = () => {
    updateUser({
      name: form.name,
      age: parseInt(form.age) || user?.age || 30,
      phone: form.phone || undefined,
      speechDescription: form.speechDescription,
    });
    setEditing(false);
  };

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: User },
    { key: 'notifications', label: 'Thông báo', icon: Bell },
    { key: 'privacy', label: 'Bảo mật', icon: Shield },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><span className="heading-highlight">Hồ sơ cá nhân</span></h1>
        <p className="page-subtitle">Quản lý thông tin và cài đặt tài khoản</p>
      </div>

      {/* Profile Header */}
      <div className="card-positivus mb-lg">
        <div className="flex items-center gap-xl">
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--gv-radius-full)',
            background: 'var(--gv-lime)', border: '3px solid var(--gv-black)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--gv-font-size-3xl)', fontWeight: 700, color: 'var(--gv-black)',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--gv-font-size-2xl)', fontWeight: 700 }}>{user?.name}</h2>
            <p className="text-secondary mt-md">{user?.email}</p>
            <div className="flex gap-lg mt-md text-sm text-muted">
              <span className="flex items-center gap-xs"><Calendar size={14} /> {user?.age} tuổi</span>
              {user?.phone && <span className="flex items-center gap-xs"><Phone size={14} /> {user.phone}</span>}
              <span className="flex items-center gap-xs"><Mail size={14} /> {user?.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-sm text-center">
            <div style={{ fontSize: 'var(--gv-font-size-3xl)', fontWeight: 700 }}>
              {user?.totalRecordings || 0}
            </div>
            <div className="text-xs text-muted">Ghi âm</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-lg">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-lime' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card-positivus">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-semibold">Thông tin cá nhân</h3>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit3 size={14} /> Chỉnh sửa
              </button>
            ) : (
              <button className="btn btn-success btn-sm" onClick={handleSave}>
                <Save size={14} /> Lưu
              </button>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              {editing ? (
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              ) : (
                <div className="form-input" style={{ background: 'var(--gv-light)', border: '2px solid transparent' }}>{user?.name}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Tuổi</label>
              {editing ? (
                <input type="number" className="form-input" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              ) : (
                <div className="form-input" style={{ background: 'var(--gv-light)', border: '2px solid transparent' }}>{user?.age}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input" style={{ background: 'var(--gv-light)', border: '2px solid transparent', color: 'var(--gv-text-muted)' }}>
                {user?.email} 🔒
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              {editing ? (
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              ) : (
                <div className="form-input" style={{ background: 'var(--gv-light)', border: '2px solid transparent' }}>{user?.phone || '—'}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả khó khăn giọng nói</label>
            {editing ? (
              <textarea
                className="form-textarea"
                value={form.speechDescription}
                onChange={e => setForm(f => ({ ...f, speechDescription: e.target.value }))}
              />
            ) : (
              <div className="form-input" style={{ background: 'var(--gv-light)', border: '2px solid transparent', minHeight: 60 }}>
                {user?.speechDescription || '—'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card-positivus">
          <h3 className="font-semibold mb-lg">Tùy chọn thông báo</h3>
          {[
            { label: 'Nhắc nhở luyện tập hàng ngày', desc: 'Nhận thông báo nhắc luyện tập vào giờ đã đặt', enabled: true },
            { label: 'Thông báo cột mốc', desc: 'Nhận thông báo khi đạt cột mốc mới', enabled: true },
            { label: 'Video mới', desc: 'Nhận thông báo khi có video hướng dẫn mới', enabled: true },
            { label: 'Email tổng kết tuần', desc: 'Nhận email báo cáo tiến độ hàng tuần', enabled: false },
            { label: 'SMS nhắc nhở', desc: 'Nhận tin nhắn SMS nhắc luyện tập (tùy chọn)', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              padding: 'var(--gv-space-md) 0',
              borderBottom: i < 4 ? '1px solid var(--gv-border)' : 'none',
            }}>
              <div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-muted">{item.desc}</div>
              </div>
              <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={item.enabled} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 'var(--gv-radius-full)',
                  background: item.enabled ? 'var(--gv-black)' : 'var(--gv-border)',
                  transition: 'background var(--gv-transition)',
                }}>
                  <span style={{
                    position: 'absolute', top: 3, left: item.enabled ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: item.enabled ? 'var(--gv-lime)' : 'white',
                    transition: 'left var(--gv-transition)',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="card-positivus">
          <h3 className="font-semibold mb-lg">Bảo mật & Quyền riêng tư</h3>

          <div className="flex flex-col gap-lg">
            <div className="flex items-center justify-between" style={{ padding: 'var(--gv-space-md)', background: 'var(--gv-light)', borderRadius: 'var(--gv-radius-md)', border: '1px solid var(--gv-border)' }}>
              <div>
                <div className="font-semibold text-sm">Xác thực 2 bước (2FA)</div>
                <div className="text-xs text-muted">Bảo vệ tài khoản với mã xác thực bổ sung</div>
              </div>
              <button className="btn btn-secondary btn-sm"><Shield size={14} /> Thiết lập</button>
            </div>

            <div className="flex items-center justify-between" style={{ padding: 'var(--gv-space-md)', background: 'var(--gv-light)', borderRadius: 'var(--gv-radius-md)', border: '1px solid var(--gv-border)' }}>
              <div>
                <div className="font-semibold text-sm">Tải dữ liệu cá nhân</div>
                <div className="text-xs text-muted">Tải xuống toàn bộ dữ liệu hồ sơ và ghi âm của bạn</div>
              </div>
              <button className="btn btn-secondary btn-sm"><Download size={14} /> Tải về</button>
            </div>

            <div className="flex items-center justify-between" style={{ padding: 'var(--gv-space-md)', background: 'var(--gv-error-soft)', borderRadius: 'var(--gv-radius-md)', border: '1px solid var(--gv-error)' }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--gv-error)' }}>Xóa tài khoản</div>
                <div className="text-xs text-muted">Xóa vĩnh viễn tất cả dữ liệu trong vòng 30 ngày</div>
              </div>
              <button className="btn btn-danger btn-sm"><Trash2 size={14} /> Yêu cầu xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
