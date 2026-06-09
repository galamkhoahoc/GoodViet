import { useState } from 'react';
import { mockExperts } from '../data/mockExperts';
import { Star, Award, Users, MessageSquare, Send, CheckCircle } from 'lucide-react';

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={interactive ? 24 : 16}
          className={`star ${i <= (hover || rating) ? 'filled' : ''}`}
          fill={i <= (hover || rating) ? '#F5A623' : 'none'}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
}

export function ExpertPage() {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [reason, setReason] = useState('');

  const handleRequest = () => {
    if (!reason.trim()) return;
    setRequestSent(true);
    setTimeout(() => {
      setShowRequest(false);
      setRequestSent(false);
      setReason('');
    }, 2000);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title">👨‍⚕️ Kết nối <span className="heading-highlight">Chuyên gia</span></h1>
        <p className="page-subtitle">Tìm và kết nối với chuyên gia âm ngữ trị liệu phù hợp</p>
      </div>

      {/* Info Banner */}
      <div className="card-dark mb-lg" style={{ borderLeft: '4px solid var(--gv-lime)' }}>
        <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
          💡 <strong style={{ color: 'var(--gv-lime)' }}>GOODVIET Expert</strong> là dịch vụ kết nối 1:1 với chuyên gia. Bạn có thể yêu cầu kết nối bất kỳ lúc nào,
          hoặc hệ thống sẽ đề xuất khi lộ trình luyện tập chưa đạt kết quả mong muốn.
        </p>
      </div>

      {/* Expert Grid */}
      <div className="grid-2">
        {mockExperts.map(expert => (
          <div
            key={expert.expertId}
            className="card-positivus"
            style={{
              cursor: 'pointer',
              background: selectedExpert === expert.expertId ? 'var(--gv-lime-soft)' : undefined,
            }}
            onClick={() => setSelectedExpert(expert.expertId === selectedExpert ? null : expert.expertId)}
          >
            <div className="flex items-center gap-md mb-md">
              <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: 'var(--gv-font-size-md)' }}>
                {expert.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div className="font-semibold">{expert.name}</div>
                <div className="flex items-center gap-sm mt-md">
                  <StarRating rating={Math.round(expert.rating)} />
                  <span className="text-sm font-semibold">{expert.rating}</span>
                </div>
              </div>
              <span className="badge badge-success">Sẵn sàng</span>
            </div>

            <p className="text-sm text-secondary mb-md" style={{ lineHeight: 1.6 }}>
              {expert.bio}
            </p>

            <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
              {expert.specializations.map((s, i) => (
                <span key={i} className="badge badge-primary">{s}</span>
              ))}
            </div>

            <div className="flex items-center gap-lg text-sm text-muted">
              <span className="flex items-center gap-xs"><Users size={14} /> {expert.totalUsers} học viên</span>
              <span className="flex items-center gap-xs"><MessageSquare size={14} /> {expert.totalSessions} buổi</span>
            </div>

            {selectedExpert === expert.expertId && (
              <div style={{ marginTop: 'var(--gv-space-lg)', borderTop: '2px solid var(--gv-border)', paddingTop: 'var(--gv-space-lg)' }}>
                <h4 className="font-semibold mb-sm">Bằng cấp & Chứng chỉ</h4>
                <ul className="flex flex-col gap-xs mb-lg">
                  {expert.credentials.map((c, i) => (
                    <li key={i} className="text-sm text-secondary flex items-center gap-sm">
                      <Award size={14} /> {c}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-lime w-full" onClick={(e) => { e.stopPropagation(); setShowRequest(true); }}>
                  <Send size={16} /> Yêu cầu kết nối
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection Request Modal */}
      {showRequest && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => !requestSent && setShowRequest(false)}>
          <div className="card-positivus animate-scale-in" style={{ maxWidth: 500, width: '90%', background: 'var(--gv-white)' }} onClick={e => e.stopPropagation()}>
            {requestSent ? (
              <div className="text-center" style={{ padding: 'var(--gv-space-xl)' }}>
                <CheckCircle size={48} color="var(--gv-success)" style={{ margin: '0 auto var(--gv-space-lg)' }} />
                <h3 className="font-semibold mb-md">Yêu cầu đã được gửi!</h3>
                <p className="text-secondary">Chuyên gia sẽ xem xét hồ sơ và phản hồi trong vòng 24 giờ.</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold mb-lg">Yêu cầu kết nối chuyên gia</h3>
                <div className="form-group">
                  <label className="form-label">Lý do kết nối</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ví dụ: Tôi muốn được hỗ trợ thêm về phát âm L/N vì lộ trình tự luyện chưa cải thiện nhiều..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted mb-lg">
                  ℹ️ GOODVIET sẽ gửi toàn bộ hồ sơ luyện tập và ghi âm của bạn cho chuyên gia để đánh giá.
                </p>
                <div className="flex gap-md">
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRequest(false)}>Hủy</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleRequest}>
                    <Send size={16} /> Gửi yêu cầu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
