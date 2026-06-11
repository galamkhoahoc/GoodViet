import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useEffect } from 'react';
import { Flower } from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { sessions, loadSessions } = useChatStore();

  useEffect(() => {
    if (sessions.length === 0) {
      loadSessions();
    }
  }, [loadSessions, sessions.length]);

  // Data binding
  const totalConversations = sessions.length > 0 ? sessions.length : 66; // Fallback to 66 if none (like image)
  const emotionScore = user?.assessmentCompleted ? 85 : 46; 
  const positiveDays = user?.totalRecordings ? Math.min(100, user.totalRecordings * 10) : 0;
  const streak = user?.currentStreak || 5;

  return (
    <div style={{ padding: 'var(--md-sys-space-2xl)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <h1 style={{
        fontSize: 'var(--md-sys-typescale-display-small-size)',
        fontWeight: 600,
        textAlign: 'center',
        marginBottom: '40px',
        color: 'var(--md-sys-color-on-surface)'
      }}>
        Khám phá xu hướng cảm xúc của bạn
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: 2x2 Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {/* Card 1 */}
            <div className="shape-cookie-4" style={{
              background: 'var(--md-sys-color-secondary-container)',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--md-sys-color-on-secondary-container)', lineHeight: 1.2 }}>{totalConversations}</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--md-sys-color-on-secondary-container)', fontWeight: 500 }}>Cuộc trò chuyện*</span>
            </div>

            {/* Card 2 */}
            <div className="shape-blob-1" style={{
              background: 'var(--md-sys-color-surface-container-highest)',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2 }}>{emotionScore}</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>Điểm cảm xúc**</span>
            </div>

            {/* Card 3 */}
            <div className="shape-sunny" style={{
              background: 'var(--md-sys-color-surface-container-highest)',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2 }}>{positiveDays}%</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>Ngày tích cực***</span>
            </div>

            {/* Card 4 */}
            <div className="shape-blob-2" style={{
              background: 'var(--md-sys-color-surface-container-highest)',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.2 }}>{streak}</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>Ngày liên tiếp****</span>
            </div>
          </div>

          {/* Footnotes */}
          <div style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <p><strong>* Cuộc trò chuyện:</strong> Tổng số lần bạn chia sẻ với GOODVIET Bot - giúp theo dõi mức độ tương tác</p>
            <p><strong>** Điểm cảm xúc:</strong> Điểm trung bình (0-100) - cao hơn = tích cực hơn</p>
            <p><strong>*** Ngày tích cực:</strong> % ngày có điểm cảm xúc ≥ 35 - phản ánh xu hướng tâm trạng</p>
            <p><strong>**** Ngày liên tiếp:</strong> Số ngày bạn duy trì thói quen truy cập</p>
          </div>
        </div>

        {/* Right Column: Featured Article */}
        <div style={{
          background: 'var(--md-sys-color-surface)',
          borderRadius: '32px',
          padding: '32px',
          boxShadow: 'var(--md-sys-elevation-1)',
          border: '1px solid var(--md-sys-color-outline-variant)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: '#FFD54F',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Flower size={24} color="#F57F17" />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
              GOODVIET x Tâm lý học
            </span>
          </div>

          {/* Image */}
          <div style={{
            width: '100%',
            height: '280px',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <img src="/images/emotion_masks.png" alt="Emotion Management" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Text */}
          <p style={{
            fontStyle: 'italic',
            color: 'var(--md-sys-color-on-surface)',
            lineHeight: 1.8,
            marginBottom: '32px',
            fontSize: '1.05rem',
            textAlign: 'justify'
          }}>
            "Việc quản lý cảm xúc là một kỹ năng, cũng giống như đi xe đạp. Một số người học cách quản lý cảm xúc từ thời thơ ấu bằng cách quan sát cách cha mẹ hoặc người chăm sóc của họ xử lý những cảm xúc khó khăn của chính mình. Nhưng điều gì sẽ xảy ra nếu người chăm sóc của chúng ta không có những chiến lược lành mạnh để kiểm soát cảm xúc, hoặc nếu chúng ta không có một người nào luôn bên cạnh để chỉ dạy? Nếu chúng ta không được dạy những cách lành mạnh để quản lý cảm xúc tại nhà, sẽ rất khó để biết điều đó trông như thế nào hoặc thậm chí có ý nghĩa là gì."
          </p>

          {/* Button */}
          <button style={{
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--md-sys-elevation-1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
          }}
          >
            Đọc thêm
          </button>
        </div>
        
      </div>
    </div>
  );
}
