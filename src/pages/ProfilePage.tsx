import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Calendar, Edit3, Save, Shield, Bell, Download, Trash2, Clock, CheckCircle, Activity } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'notifications' | 'privacy'>('profile');

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await practiceApi.getHistory();
      setHistory(res.history);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tải lịch sử luyện tập');
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
  };

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: User },
    { key: 'history', label: 'Lịch sử luyện tập', icon: Activity },
    { key: 'notifications', label: 'Thông báo', icon: Bell },
    { key: 'privacy', label: 'Bảo mật', icon: Shield },
  ];

  return (
    <div style={{ padding: 'var(--md-sys-space-2xl)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--md-sys-space-2xl)' }}>
        <h1 style={{
          fontSize: 'var(--md-sys-typescale-headline-medium-size)',
          fontWeight: 'var(--md-sys-typescale-headline-medium-weight)',
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--md-sys-space-xs)',
        }}>
          <span style={{ color: 'var(--md-sys-color-primary)' }}>Hồ sơ cá nhân</span>
        </h1>
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-large-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Quản lý thông tin và cài đặt tài khoản
        </p>
      </div>


      {/* Profile Header Card */}
      <div style={{
        background: 'var(--md-sys-color-surface-container-lowest)',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--md-sys-space-2xl)',
        marginBottom: 'var(--md-sys-space-xl)',
        boxShadow: 'var(--md-sys-elevation-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--md-sys-space-xl)',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 'var(--md-sys-shape-corner-full)',
          background: 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--md-sys-typescale-headline-large-size)',
          fontWeight: 700,
        }}>
          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{
            fontSize: 'var(--md-sys-typescale-headline-small-size)',
            fontWeight: 700,
            color: 'var(--md-sys-color-on-surface)',
          }}>
            {user?.fullName}
          </h2>
          <p style={{
            fontSize: 'var(--md-sys-typescale-body-large-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: 'var(--md-sys-space-xs)',
          }}>
            {user?.email}
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--md-sys-space-lg)',
            marginTop: 'var(--md-sys-space-md)',
            fontSize: 'var(--md-sys-typescale-body-small-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}>
              <Calendar size={14} /> {user?.age} tuổi
            </span>
            {user?.phoneNumber && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}>
                <Phone size={14} /> {user.phoneNumber}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}>
              <Mail size={14} /> {user?.email}
            </span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--md-sys-space-xs)',
          padding: 'var(--md-sys-space-lg)',
          borderRadius: 'var(--md-sys-shape-corner-large)',
          background: 'var(--md-sys-color-secondary-container)',
        }}>
          <div style={{
            fontSize: 'var(--md-sys-typescale-headline-large-size)',
            fontWeight: 700,
            color: 'var(--md-sys-color-on-secondary-container)',
          }}>
            {user?.totalRecordings || 0}
          </div>
          <div style={{
            fontSize: 'var(--md-sys-typescale-body-small-size)',
            color: 'var(--md-sys-color-on-secondary-container)',
          }}>
            Ghi âm
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--md-sys-space-md)',
        marginBottom: 'var(--md-sys-space-xl)',
        overflowX: 'auto',
        paddingBottom: 'var(--md-sys-space-xs)'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '10px 24px',
                background: isActive ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                color: isActive ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)',
                border: '1px solid var(--md-sys-color-outline)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 'var(--md-sys-typescale-label-large-weight)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--md-sys-space-sm)',
                transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--md-sys-color-surface-container)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in-up" style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-2xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <h3 style={{
              fontSize: 'var(--md-sys-typescale-title-large-size)',
              fontWeight: 'var(--md-sys-typescale-title-large-weight)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              Thông tin cá nhân
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '8px 20px',
                  background: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)',
                  border: 'none',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  fontSize: 'var(--md-sys-typescale-label-large-size)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-space-xs)',
                  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
              >
                <Edit3 size={14} /> Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 20px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  fontSize: 'var(--md-sys-typescale-label-large-size)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-space-xs)',
                  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
              >
                <Save size={14} /> Lưu
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--md-sys-space-xl)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-sm)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                Họ và tên
              </label>
              {editing ? (
                <input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    color: 'var(--md-sys-color-on-surface)',
                    background: 'var(--md-sys-color-surface-container)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    outline: 'none',
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  background: 'var(--md-sys-color-surface-container-high)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                }}>
                  {user?.fullName}
                </div>
              )}
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-sm)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                Tuổi
              </label>
              {editing ? (
                <input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    color: 'var(--md-sys-color-on-surface)',
                    background: 'var(--md-sys-color-surface-container)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    outline: 'none',
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  background: 'var(--md-sys-color-surface-container-high)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                }}>
                  {user?.age}
                </div>
              )}
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-sm)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                Email
              </label>
              <div style={{
                padding: '12px 16px',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
                background: 'var(--md-sys-color-surface-container-high)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--md-sys-space-xs)',
              }}>
                {user?.email} <span>🔒</span>
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-sm)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                Số điện thoại
              </label>
              {editing ? (
                <input
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    color: 'var(--md-sys-color-on-surface)',
                    background: 'var(--md-sys-color-surface-container)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    outline: 'none',
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  background: 'var(--md-sys-color-surface-container-high)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                }}>
                  {user?.phoneNumber || '—'}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--md-sys-space-sm)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              Mô tả khó khăn giọng nói
            </label>
            {editing ? (
              <textarea
                value={form.targetGoals}
                onChange={e => setForm(f => ({ ...f, targetGoals: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface)',
                  background: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  outline: 'none',
                  minHeight: 100,
                  resize: 'vertical',
                  fontFamily: 'var(--md-sys-typescale-font)',
                }}
              />
            ) : (
              <div style={{
                padding: '12px 16px',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
                background: 'var(--md-sys-color-surface-container-high)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                minHeight: 100,
              }}>
                {user?.targetGoals || '—'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="animate-fade-in-up" style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-2xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <h3 style={{
            fontSize: 'var(--md-sys-typescale-title-large-size)',
            fontWeight: 'var(--md-sys-typescale-title-large-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            Lịch sử luyện tập
          </h3>
          
          {loadingHistory ? (
            <div className="p-xl text-center">Đang tải lịch sử...</div>
          ) : history.length === 0 ? (
            <div className="text-center p-2xl">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-space-md)' }}>📈</div>
              <h3 className="font-semibold mb-md">Chưa có dữ liệu luyện tập</h3>
              <p className="text-secondary mb-lg">Hãy bắt đầu bài tập hàng ngày của bạn để theo dõi tiến độ tại đây.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {history.map((session: any) => (
                <div key={session._id} className="card-positivus flex gap-xl items-center flex-wrap" style={{ padding: 'var(--gv-space-lg)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'var(--gv-success-light)', color: 'var(--gv-success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold" style={{ fontSize: 'var(--gv-font-size-lg)' }}>
                      Tuần {session.week} - Ngày {session.day}
                    </div>
                    <div className="text-secondary text-sm mt-xs">
                      Hoàn thành {session.exercisesCompleted} bài tập
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium flex items-center gap-xs justify-end">
                      <Clock size={14} /> {new Date(session.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-xs text-muted mt-xs">
                      {new Date(session.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="animate-fade-in-up" style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-2xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <h3 style={{
            fontSize: 'var(--md-sys-typescale-title-large-size)',
            fontWeight: 'var(--md-sys-typescale-title-large-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            Tùy chọn thông báo
          </h3>
          {[
            { label: 'Nhắc nhở luyện tập hàng ngày', desc: 'Nhận thông báo nhắc luyện tập vào giờ đã đặt', enabled: true },
            { label: 'Thông báo cột mốc', desc: 'Nhận thông báo khi đạt cột mốc mới', enabled: true },
            { label: 'Video mới', desc: 'Nhận thông báo khi có video hướng dẫn mới', enabled: true },
            { label: 'Email tổng kết tuần', desc: 'Nhận email báo cáo tiến độ hàng tuần', enabled: false },
            { label: 'SMS nhắc nhở', desc: 'Nhận tin nhắn SMS nhắc luyện tập (tùy chọn)', enabled: false },
          ].map((item, i, arr) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--md-sys-space-lg) 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
              }}
            >
              <div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: 'var(--md-sys-space-xs)',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-small-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}>
                  {item.desc}
                </div>
              </div>
              <label style={{
                position: 'relative',
                width: 52,
                height: 32,
                cursor: 'pointer',
                display: 'block',
              }}>
                <input
                  type="checkbox"
                  defaultChecked={item.enabled}
                  style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                />
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: item.enabled ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
                  transition: 'background var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}>
                  <span style={{
                    position: 'absolute',
                    top: 4,
                    left: item.enabled ? 24 : 4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--md-sys-color-surface-container-highest)',
                    boxShadow: 'var(--md-sys-elevation-1)',
                    transition: 'left var(--md-motion-duration-short4) var(--md-motion-easing-expressive)',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="animate-fade-in-up" style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-2xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <h3 style={{
            fontSize: 'var(--md-sys-typescale-title-large-size)',
            fontWeight: 'var(--md-sys-typescale-title-large-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            Bảo mật & Quyền riêng tư
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-space-lg)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--md-sys-space-lg)',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
            }}>
              <div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: 'var(--md-sys-space-xs)',
                }}>
                  Xác thực 2 bước (2FA)
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-small-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}>
                  Bảo vệ tài khoản với mã xác thực bổ sung
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--md-sys-space-xs)',
              }}>
                <Shield size={14} /> Thiết lập
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--md-sys-space-lg)',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
            }}>
              <div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: 'var(--md-sys-space-xs)',
                }}>
                  Tải dữ liệu cá nhân
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-small-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}>
                  Tải xuống toàn bộ dữ liệu hồ sơ và ghi âm của bạn
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--md-sys-space-xs)',
              }}>
                <Download size={14} /> Tải về
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--md-sys-space-lg)',
              background: 'var(--md-sys-color-error-container)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              border: '1px solid var(--md-sys-color-error)',
            }}>
              <div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  fontWeight: 500,
                  color: 'var(--md-sys-color-error)',
                  marginBottom: 'var(--md-sys-space-xs)',
                }}>
                  Xóa tài khoản
                </div>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-body-small-size)',
                  color: 'var(--md-sys-color-on-error-container)',
                }}>
                  Xóa vĩnh viễn tất cả dữ liệu trong vòng 30 ngày
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'var(--md-sys-color-error)',
                color: 'var(--md-sys-color-on-error)',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--md-sys-space-xs)',
              }}>
                <Trash2 size={14} /> Yêu cầu xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
