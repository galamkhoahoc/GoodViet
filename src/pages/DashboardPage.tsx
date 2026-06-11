import { useAuthStore } from '../store/authStore';
import { Mic, Calendar, Flame, Clock, Target, BookOpen, Route as RouteIcon, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExpressiveChart } from '../components/dashboard/ExpressiveChart';

const milestones = [
  { icon: '🎯', title: 'Hoàn thành GOODVIET Check', done: false }, // We'll override with user data below
  { icon: '🔥', title: 'Streak 7 ngày liên tiếp', done: false },
  { icon: '📝', title: 'Ghi âm 10 bài tập', done: false },
  { icon: '⭐', title: 'Hoàn thành tuần 1', done: true },
  { icon: '🎓', title: 'Xem 3 video hướng dẫn', done: false },
  { icon: '🏆', title: 'Hoàn thành lộ trình', done: false },
];

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const stats = [
    { icon: Mic, label: 'Tổng ghi âm', value: user?.totalRecordings || 0, shapeClass: 'shape-cookie-4' },
    { icon: Clock, label: 'Thời gian luyện', value: `${user?.totalPracticeTime || 0}p`, shapeClass: 'shape-blob-1' },
    { icon: Flame, label: 'Streak hiện tại', value: `${user?.currentStreak || 0} ngày`, shapeClass: 'shape-sunny' },
    { icon: Calendar, label: 'Streak dài nhất', value: `${user?.longestStreak || 0} ngày`, shapeClass: 'shape-blob-2' },
  ];

  const updatedMilestones = milestones.map(m => {
    if (m.title === 'Hoàn thành GOODVIET Check') return { ...m, done: user?.assessmentCompleted || false };
    if (m.title === 'Streak 7 ngày liên tiếp') return { ...m, done: (user?.currentStreak || 0) >= 7 };
    if (m.title === 'Ghi âm 10 bài tập') return { ...m, done: (user?.totalRecordings || 0) >= 10 };
    return m;
  });

  return (
    <div style={{ padding: 'var(--md-sys-space-2xl)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--md-sys-space-2xl)', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'var(--md-sys-typescale-display-small-size)',
          fontWeight: 600,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--md-sys-space-xs)',
        }}>
          Xin chào, <span style={{ color: 'var(--md-sys-color-primary)' }}>{user?.name?.split(' ').pop() || 'bạn'}</span>! 👋
        </h1>
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-large-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Theo dõi tiến bộ và tiếp tục hành trình cải thiện giọng nói
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        
        {/* Top Section: Organic Stat Cards & Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Left: 2x2 Grid of Organic Shapes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {stats.map((s, i) => (
              <div key={i} className={s.shapeClass} style={{
                background: i % 2 === 0 ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container-highest)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px',
                textAlign: 'center',
                boxShadow: 'var(--md-sys-elevation-1)',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ 
                  marginBottom: '12px', 
                  color: i % 2 === 0 ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' 
                }}>
                  <s.icon size={28} />
                </div>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: i % 2 === 0 ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)', 
                  lineHeight: 1.2 
                }}>{s.value}</span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: i % 2 === 0 ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)', 
                  fontWeight: 500,
                  marginTop: '8px'
                }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Right: Expressive Chart */}
          <div style={{
            background: 'var(--md-sys-color-surface)',
            borderRadius: '32px',
            padding: '32px',
            boxShadow: 'var(--md-sys-elevation-1)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column'
          }}>
             <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                width: '40px', height: '40px', 
                background: 'var(--md-sys-color-primary-container)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--md-sys-color-on-primary-container)'
              }}>
                <Clock size={24} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--md-sys-color-on-surface)' }}>
                Thời gian luyện tập (phút/ngày)
              </span>
            </div>
            <ExpressiveChart />
          </div>
        </div>

        {/* Bottom Row: Quick Actions & Milestones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 'var(--md-sys-space-xl)',
        }}>
          {/* Quick Actions */}
          <div style={{
            background: 'var(--md-sys-color-surface-container-lowest)',
            borderRadius: '32px',
            padding: '32px',
            boxShadow: 'var(--md-sys-elevation-1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--md-sys-space-sm)',
              marginBottom: 'var(--md-sys-space-xl)',
            }}>
              <Target size={24} color="var(--md-sys-color-tertiary)" />
              <span style={{
                fontSize: 'var(--md-sys-typescale-title-large-size)',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
              }}>
                Hành động nhanh
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!user?.assessmentCompleted && (
                <button
                  onClick={() => navigate('/assessment')}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <BookOpen size={20} /> Bắt đầu GOODVIET Check
                </button>
              )}
              <button
                onClick={() => navigate('/pathway')}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--md-sys-elevation-1)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)'}
              >
                <RouteIcon size={20} /> Tiếp tục luyện tập
              </button>
              <button
                onClick={() => navigate('/chat')}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'transparent',
                  color: 'var(--md-sys-color-primary)',
                  border: '2px solid var(--md-sys-color-primary)',
                  borderRadius: '999px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Mic size={20} /> Chat với GOODVIET Bot
              </button>
            </div>
          </div>

          {/* Milestones */}
          <div style={{
            background: 'var(--md-sys-color-surface-container-lowest)',
            borderRadius: '32px',
            padding: '32px',
            boxShadow: 'var(--md-sys-elevation-1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--md-sys-space-sm)',
              marginBottom: 'var(--md-sys-space-xl)',
            }}>
              <Award size={24} color="var(--md-sys-color-tertiary)" />
              <span style={{
                fontSize: 'var(--md-sys-typescale-title-large-size)',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
              }}>
                Cột mốc đạt được
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {updatedMilestones.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '24px',
                    background: m.done ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
                    border: m.done ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent',
                    opacity: m.done ? 1 : 0.7,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                  <span style={{
                    fontSize: '1rem',
                    color: m.done ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                    fontWeight: m.done ? 600 : 500,
                    flex: 1,
                  }}>
                    {m.title}
                  </span>
                  {m.done && <span style={{ fontWeight: 800, color: 'var(--md-sys-color-primary)', fontSize: '1.2rem' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
