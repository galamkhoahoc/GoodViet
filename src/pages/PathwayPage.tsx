import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Flame, Clock, TrendingUp, BookOpen, Headphones, Mic, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function PathwayPage() {
  const user = useAuthStore(s => s.user);
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Format date as "Thứ Năm, 24 Tháng 10"
  const formatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayName}, ${day} Tháng ${month}`;
  };

  // Sample data for daily exercises
  const exercises = [
    {
      id: 1,
      type: 'Đọc hiểu',
      icon: <BookOpen size={24} />,
      title: 'Văn hóa Trà',
      status: 'Chưa làm',
      statusColor: '#9ca3af',
      progress: 0,
    },
    {
      id: 2,
      type: 'Nghe',
      icon: <Headphones size={24} />,
      title: 'Podcast Lịch sử',
      status: 'Đang làm',
      statusColor: '#1f2937',
      progress: 45,
    },
    {
      id: 3,
      type: 'Nói',
      icon: <Mic size={24} />,
      title: 'Giao tiếp hàng ngày',
      status: 'Chưa làm',
      statusColor: '#9ca3af',
      progress: 0,
    },
  ];

  // Sample recommendations
  const recommendations = [
    { id: 1, title: 'Luyện phát âm cơ bản', description: 'Bài học phù hợp với bạn' },
    { id: 2, title: 'Từ vựng thiết yếu', description: '100 từ quan trọng' },
  ];

  // Calendar generation
  const generateCalendar = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const calendar = [];
    let week = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    
    // Fill remaining cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      calendar.push(week);
    }
    
    return calendar;
  };

  const calendar = generateCalendar(currentMonth);
  const completedDays = [5, 8, 10, 12, 15, 17, 19, 21, 22, 23, 24]; // Sample completed days
  const currentDay = currentDate.getDate();
  const isCurrentMonth = currentMonth.getMonth() === currentDate.getMonth() && 
                         currentMonth.getFullYear() === currentDate.getFullYear();

  return (
    <div className="w-full h-full" style={{ 
      background: '#ecefe5',
      padding: '24px',
      overflowY: 'auto'
    }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '4px' 
          }}>
            {formatDate(currentDate)}
          </p>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700,
            color: '#1f2937',
            margin: 0
          }}>
            Tiến độ hôm nay
          </h1>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#d6e4c8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          {user?.username?.[0].toUpperCase() || 'U'}
        </div>
      </div>

      {/* Hero Banner with Quote */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(32, 81, 7, 0.9), rgba(56, 102, 102, 0.8)), url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '28px',
        padding: '48px 32px',
        marginBottom: '24px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <p style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'white',
          lineHeight: 1.5,
          maxWidth: '600px',
          margin: 0
        }}>
          "Học một ngôn ngữ mới là mở ra một cánh cửa mới của thế giới"
        </p>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: '12px'
        }}>
          — Khuyết danh
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Streak Card */}
        <div style={{
          background: '#386666',
          borderRadius: '24px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Flame size={24} color="white" />
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Chuỗi ngày</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '4px' }}>14</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Ngày</div>
        </div>

        {/* Daily Goal Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            marginBottom: '12px'
          }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#205107"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.75)}`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#205107' }}>75%</div>
            </div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Mục tiêu hôm nay</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Còn lại 15 phút</div>
        </div>

        {/* Weekly Progress Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="#205107" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Tuần này</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '60px' }}>
            {[40, 65, 80, 100, 50, 30, 20].map((height, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%',
                  height: `${height}%`,
                  background: i < 4 ? '#205107' : '#e5e7eb',
                  borderRadius: '4px'
                }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
            4/7 ngày hoàn thành
          </div>
        </div>
      </div>

      {/* Daily Exercises Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Bài tập hôm nay
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {exercises.map((exercise) => (
            <div key={exercise.id} style={{
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f2f5eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#205107',
                marginBottom: '16px'
              }}>
                {exercise.icon}
              </div>
              <div style={{
                padding: '4px 12px',
                background: exercise.statusColor,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                {exercise.status}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {exercise.type}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                {exercise.title}
              </p>
              {exercise.progress > 0 && (
                <div>
                  <div style={{
                    height: '6px',
                    background: '#f3f4f6',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${exercise.progress}%`,
                      background: '#205107',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{exercise.progress}% hoàn thành</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Split Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {/* Recommendations */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Gợi ý cho bạn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map((rec) => (
              <div key={rec.id} style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {rec.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {rec.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div>
            {/* Day headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            {calendar.map((week, weekIdx) => (
              <div key={weekIdx} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '8px'
              }}>
                {week.map((day, dayIdx) => {
                  if (!day) {
                    return <div key={dayIdx} />;
                  }
                  
                  const isCompleted = isCurrentMonth && completedDays.includes(day);
                  const isToday = isCurrentMonth && day === currentDay;
                  const isInStreak = isCompleted && day <= currentDay;
                  
                  return (
                    <div key={dayIdx} style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'white' : isCompleted ? '#205107' : '#1f2937',
                      background: isToday ? '#205107' : 'transparent',
                      borderRadius: '50%',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      {day}
                      {isCompleted && !isToday && (
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#205107'
                        }} />
                      )}
                      {isToday && (
                        <div style={{
                          position: 'absolute',
                          inset: '-2px',
                          border: '2px solid #205107',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Calendar Legend */}
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#205107'
              }} />
              <span>Hoàn thành</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#205107',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white'
              }}>
                {currentDay}
              </div>
              <span>Hôm nay</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={16} color="#205107" />
              <span>Chuỗi hiện tại: 14 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
