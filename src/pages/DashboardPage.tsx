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
    { icon: Mic, label: 'Tổng ghi âm', value: user?.totalRecordings || 0, color: '#191A23', bg: '#B9FF66' },
    { icon: Clock, label: 'Thời gian luyện', value: `${user?.totalPracticeTime || 0}p`, color: '#191A23', bg: '#F3F3F3' },
    { icon: Flame, label: 'Streak hiện tại', value: `${user?.currentStreak || 0} ngày`, color: '#E74C3C', bg: 'rgba(231,76,60,0.08)' },
    { icon: Calendar, label: 'Streak dài nhất', value: `${user?.longestStreak || 0} ngày`, color: '#3AC267', bg: 'rgba(58,194,103,0.08)' },
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
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title">
          Xin chào, <span className="heading-highlight">{user?.name?.split(' ').pop() || 'bạn'}</span>! 👋
        </h1>
        <p className="page-subtitle">Theo dõi tiến bộ và tiếp tục hành trình cải thiện giọng nói</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--gv-space-xl)' }}>
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 'var(--gv-space-xl)' }}>
        <div className="card-positivus">
          <div className="flex items-center gap-sm mb-lg">
            <TrendingUp size={20} />
            <span className="font-semibold">Điểm cải thiện theo tuần</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E1E6" />
              <XAxis dataKey="week" stroke="#6B6C7A" fontSize={12} />
              <YAxis stroke="#6B6C7A" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFF', border: '2px solid #191A23', borderRadius: 14 }}
                labelStyle={{ color: '#191A23', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="score" stroke="#191A23" strokeWidth={3} dot={{ fill: '#B9FF66', stroke: '#191A23', strokeWidth: 2, r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-positivus">
          <div className="flex items-center gap-sm mb-lg">
            <Clock size={20} />
            <span className="font-semibold">Thời gian luyện tập (phút/ngày)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyPractice}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E1E6" />
              <XAxis dataKey="day" stroke="#6B6C7A" fontSize={12} />
              <YAxis stroke="#6B6C7A" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFF', border: '2px solid #191A23', borderRadius: 14 }}
                labelStyle={{ color: '#191A23', fontWeight: 600 }}
              />
              <Bar dataKey="minutes" fill="#B9FF66" stroke="#191A23" strokeWidth={1} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Quick Actions */}
        <div className="card-positivus">
          <div className="flex items-center gap-sm mb-lg">
            <Target size={20} />
            <span className="font-semibold">Hành động nhanh</span>
          </div>
          <div className="flex flex-col gap-sm">
            {!user?.assessmentCompleted && (
              <button className="btn btn-lime w-full" onClick={() => navigate('/assessment')}>
                <BookOpen size={16} /> Bắt đầu GOODVIET Check
              </button>
            )}
            <button className="btn btn-primary w-full" onClick={() => navigate('/pathway')}>
              <RouteIcon size={16} /> Tiếp tục luyện tập
            </button>
            <button className="btn btn-secondary w-full" onClick={() => navigate('/chat')}>
              <Mic size={16} /> Chat với GOODVIET Bot
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div className="card-positivus">
          <div className="flex items-center gap-sm mb-lg">
            <Award size={20} />
            <span className="font-semibold">Cột mốc đạt được</span>
          </div>
          <div className="flex flex-col gap-sm">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-md" style={{
                padding: '10px 14px', borderRadius: 'var(--gv-radius-md)',
                background: m.done ? 'var(--gv-lime-soft)' : 'var(--gv-light)',
                border: m.done ? '1px solid var(--gv-lime-dark)' : '1px solid transparent',
                opacity: m.done ? 1 : 0.5,
              }}>
                <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                <span className="text-sm" style={{
                  color: m.done ? 'var(--gv-black)' : 'var(--gv-text-muted)',
                  fontWeight: m.done ? 600 : 400,
                }}>
                  {m.title}
                </span>
                {m.done && <span style={{ marginLeft: 'auto', fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
