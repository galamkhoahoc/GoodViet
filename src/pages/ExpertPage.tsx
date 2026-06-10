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
    <div style={{ padding: 'var(--md-sys-space-2xl)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--md-sys-space-2xl)' }}>
        <h1 style={{
          fontSize: 'var(--md-sys-typescale-headline-medium-size)',
          fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--md-sys-space-xs)',
        }}>
          👨‍⚕️ Kết nối <span style={{ color: 'var(--md-sys-color-primary)' }}>Chuyên gia</span>
        </h1>
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-large-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Tìm và kết nối với chuyên gia âm ngữ trị liệu phù hợp
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'var(--md-sys-color-tertiary-container)',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--md-sys-space-xl)',
        marginBottom: 'var(--md-sys-space-xl)',
        borderLeft: `4px solid var(--md-sys-color-tertiary)`,
      }}>
        <p style={{
          lineHeight: 1.8,
          color: 'var(--md-sys-color-on-tertiary-container)',
          fontSize: 'var(--md-sys-typescale-body-large-size)',
        }}>
          💡 <strong>GOODVIET Expert</strong> là dịch vụ kết nối 1:1 với chuyên gia. Bạn có thể yêu cầu kết nối bất kỳ lúc nào,
          hoặc hệ thống sẽ đề xuất khi lộ trình luyện tập chưa đạt kết quả mong muốn.
        </p>
      </div>

      {/* Expert Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--md-sys-space-xl)',
      }}>
        {mockExperts.map(expert => (
          <div
            key={expert.expertId}
            onClick={() => setSelectedExpert(expert.expertId === selectedExpert ? null : expert.expertId)}
            style={{
              background: selectedExpert === expert.expertId ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-lowest)',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              padding: 'var(--md-sys-space-xl)',
              cursor: 'pointer',
              transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              boxShadow: 'var(--md-sys-elevation-1)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)'}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--md-sys-space-md)',
              marginBottom: 'var(--md-sys-space-md)',
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--md-sys-typescale-headline-small-size)',
              }}>
                {expert.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'var(--md-sys-typescale-title-medium-size)',
                  fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface)',
                }}>
                  {expert.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-space-sm)',
                  marginTop: 'var(--md-sys-space-xs)',
                }}>
                  <StarRating rating={Math.round(expert.rating)} />
                  <span style={{
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    fontWeight: 500,
                    color: 'var(--md-sys-color-on-surface)',
                  }}>
                    {expert.rating}
                  </span>
                </div>
              </div>
              <span style={{
                padding: '6px 16px',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                fontSize: 'var(--md-sys-typescale-label-small-size)',
                fontWeight: 500,
              }}>
                Sẵn sàng
              </span>
            </div>

            <p style={{
              fontSize: 'var(--md-sys-typescale-body-medium-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
              lineHeight: 1.6,
              marginBottom: 'var(--md-sys-space-md)',
            }}>
              {expert.bio}
            </p>

            <div style={{
              display: 'flex',
              gap: 'var(--md-sys-space-sm)',
              flexWrap: 'wrap',
              marginBottom: 'var(--md-sys-space-md)',
            }}>
              {expert.specializations.map((s, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 12px',
                    background: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--md-sys-space-xl)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}>
                <Users size={14} /> {expert.totalUsers} học viên
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}>
                <MessageSquare size={14} /> {expert.totalSessions} buổi
              </span>
            </div>

            {selectedExpert === expert.expertId && (
              <div style={{
                marginTop: 'var(--md-sys-space-xl)',
                borderTop: `1px solid var(--md-sys-color-outline-variant)`,
                paddingTop: 'var(--md-sys-space-xl)',
              }}>
                <h4 style={{
                  fontSize: 'var(--md-sys-typescale-title-small-size)',
                  fontWeight: 500,
                  marginBottom: 'var(--md-sys-space-sm)',
                  color: 'var(--md-sys-color-on-surface)',
                }}>
                  Bằng cấp & Chứng chỉ
                </h4>
                <ul style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--md-sys-space-xs)',
                  marginBottom: 'var(--md-sys-space-xl)',
                  listStyle: 'none',
                  padding: 0,
                }}>
                  {expert.credentials.map((c, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 'var(--md-sys-typescale-body-small-size)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--md-sys-space-sm)',
                      }}
                    >
                      <Award size={14} /> {c}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRequest(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    fontSize: 'var(--md-sys-typescale-label-large-size)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--md-sys-space-sm)',
                    boxShadow: 'var(--md-sys-elevation-1)',
                    transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                  }}
                >
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
