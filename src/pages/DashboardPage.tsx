import { useAuthStore } from '../store/authStore';
import { Mic, Calendar, Flame, Clock, TrendingUp, Target, BookOpen, Award, Route as RouteIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const weeklyData = [
  { week: 'T1', score: 45 }, { week: 'T2', score: 52 }, { week: 'T3', score: 58 },
  { week: 'T4', score: 65 }, { week: 'T5', score: 72 },
];

const dailyPractice = [
  { day: 'T2', minutes: 12 }, { day: 'T3', minutes: 15 }, { day: 'T4', minutes: 10 },
  { day: 'T5', minutes: 18 }, { day: 'T6', minutes: 8 }, { day: 'T7', minutes: 14 },
  { day: 'CN', minutes: 0 },
];

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const stats = [
    { icon: Mic, label: 'Tổng ghi âm', value: user?.totalRecordings || 0 },
    { icon: Clock, label: 'Thời gian luyện', value: `${user?.totalPracticeTime || 0}p` },
    { icon: Flame, label: 'Streak hiện tại', value: `${user?.currentStreak || 0} ngày` },
    { icon: Calendar, label: 'Streak dài nhất', value: `${user?.longestStreak || 0} ngày` },
  ];

  const milestones = [
    { icon: '🎯', title: 'Hoàn thành GOODVIET Check', done: user?.assessmentCompleted || false },
    { icon: '🔥', title: 'Streak 7 ngày liên tiếp', done: (user?.currentStreak || 0) >= 7 },
    { icon: '📝', title: 'Ghi âm 10 bài tập', done: (user?.totalRecordings || 0) >= 10 },
    { icon: '⭐', title: 'Hoàn thành tuần 1', done: true },
    { icon: '🎓', title: 'Xem 3 video hướng dẫn', done: false },
    { icon: '🏆', title: 'Hoàn thành lộ trình', done: false },
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
          Xin chào, <span style={{ color: 'var(--md-sys-color-primary)' }}>{user?.name?.split(' ').pop() || 'bạn'}</span>! 👋
        </h1>
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-large-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Theo dõi tiến bộ và tiếp tục hành trình cải thiện giọng nói
        </p>
      </div>


      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--md-sys-space-lg)',
        marginBottom: 'var(--md-sys-space-2xl)',
      }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: 'var(--md-sys-color-surface-container-low)',
              borderRadius: 'var(--md-sys-shape-corner-large)',
              padding: 'var(--md-sys-space-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--md-sys-space-md)',
              transition: 'all var(--md-motion-duration-medium2) var(--md-motion-easing-standard)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container)';
              e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-low)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--md-sys-shape-corner-medium)',
              background: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <s.icon size={24} />
            </div>
            <div style={{
              fontSize: 'var(--md-sys-typescale-headline-small-size)',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--md-sys-space-xl)',
        marginBottom: 'var(--md-sys-space-2xl)',
      }}>
        <div style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--md-sys-space-sm)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <TrendingUp size={20} color="var(--md-sys-color-primary)" />
            <span style={{
              fontSize: 'var(--md-sys-typescale-title-medium-size)',
              fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              Điểm cải thiện theo tuần
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" />
              <XAxis dataKey="week" stroke="var(--md-sys-color-on-surface-variant)" fontSize={12} />
              <YAxis stroke="var(--md-sys-color-on-surface-variant)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--md-sys-color-surface-container-highest)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  boxShadow: 'var(--md-sys-elevation-2)',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--md-sys-color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--md-sys-color-primary-container)', stroke: 'var(--md-sys-color-primary)', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--md-sys-space-sm)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <Clock size={20} color="var(--md-sys-color-secondary)" />
            <span style={{
              fontSize: 'var(--md-sys-typescale-title-medium-size)',
              fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              Thời gian luyện tập (phút/ngày)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyPractice}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" />
              <XAxis dataKey="day" stroke="var(--md-sys-color-on-surface-variant)" fontSize={12} />
              <YAxis stroke="var(--md-sys-color-on-surface-variant)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--md-sys-color-surface-container-highest)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  boxShadow: 'var(--md-sys-elevation-2)',
                }}
              />
              <Bar
                dataKey="minutes"
                fill="var(--md-sys-color-secondary-container)"
                stroke="var(--md-sys-color-secondary)"
                strokeWidth={1}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 'var(--md-sys-space-xl)',
      }}>
        {/* Quick Actions */}
        <div style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--md-sys-space-sm)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <Target size={20} color="var(--md-sys-color-tertiary)" />
            <span style={{
              fontSize: 'var(--md-sys-typescale-title-medium-size)',
              fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              Hành động nhanh
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-space-md)' }}>
            {!user?.assessmentCompleted && (
              <button
                onClick={() => navigate('/assessment')}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)',
                  border: 'none',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                  fontSize: 'var(--md-sys-typescale-label-large-size)',
                  fontWeight: 'var(--md-sys-typescale-label-large-weight)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--md-sys-space-sm)',
                  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <BookOpen size={16} /> Bắt đầu GOODVIET Check
              </button>
            )}
            <button
              onClick={() => navigate('/pathway')}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 'var(--md-sys-typescale-label-large-weight)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--md-sys-space-sm)',
                transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                boxShadow: 'var(--md-sys-elevation-1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RouteIcon size={16} /> Tiếp tục luyện tập
            </button>
            <button
              onClick={() => navigate('/chat')}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--md-sys-color-primary)',
                border: '1px solid var(--md-sys-color-outline)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-large-size)',
                fontWeight: 'var(--md-sys-typescale-label-large-weight)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--md-sys-space-sm)',
                transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Mic size={16} /> Chat với GOODVIET Bot
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div style={{
          background: 'var(--md-sys-color-surface-container-lowest)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--md-sys-space-xl)',
          boxShadow: 'var(--md-sys-elevation-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--md-sys-space-sm)',
            marginBottom: 'var(--md-sys-space-xl)',
          }}>
            <Award size={20} color="var(--md-sys-color-tertiary)" />
            <span style={{
              fontSize: 'var(--md-sys-typescale-title-medium-size)',
              fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
              color: 'var(--md-sys-color-on-surface)',
            }}>
              Cột mốc đạt được
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-space-sm)' }}>
            {milestones.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-space-md)',
                  padding: '12px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  background: m.done ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
                  border: m.done ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent',
                  opacity: m.done ? 1 : 0.7,
                  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                <span style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  color: m.done ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                  fontWeight: m.done ? 500 : 400,
                  flex: 1,
                }}>
                  {m.title}
                </span>
                {m.done && <span style={{ fontWeight: 700, color: 'var(--md-sys-color-primary)' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
