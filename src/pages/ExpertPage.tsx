import { useState, useEffect } from 'react';
import { expertApi, Expert, ExpertConnection, ExpertSession } from '../services/api/expertApi';
import { Star, Award, Users, MessageSquare, Send, CheckCircle, Clock, Calendar, Video, StarHalf } from 'lucide-react';
import { toast } from '../components/common/Toast';

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
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
}

export function ExpertPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'connections' | 'sessions'>('discover');
  
  // Discover State
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  
  // Request Connection State
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Connections State
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Booking State
  const [showBookSession, setShowBookSession] = useState(false);
  const [bookConnectionId, setBookConnectionId] = useState('');
  const [bookExpertId, setBookExpertId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sessionType, setSessionType] = useState<'consultation' | 'therapy' | 'follow-up'>('consultation');

  useEffect(() => {
    if (activeTab === 'discover') {
      loadExperts();
    } else if (activeTab === 'connections') {
      loadConnections();
    } else if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab]);

  const loadExperts = async () => {
    try {
      setLoadingExperts(true);
      const res = await expertApi.getExperts();
      setExperts(res.experts);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tải danh sách chuyên gia');
    } finally {
      setLoadingExperts(false);
    }
  };

  const loadConnections = async () => {
    try {
      setLoadingConnections(true);
      const res = await expertApi.getConnections();
      setConnections(res.connections);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tải danh sách kết nối');
    } finally {
      setLoadingConnections(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await expertApi.getSessions();
      setSessions(res.sessions);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tải lịch hẹn');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRequest = async () => {
    if (!reason.trim() || !selectedExpert) return;
    
    setIsSubmitting(true);
    try {
      await expertApi.requestConnection(selectedExpert);
      setRequestSent(true);
      setTimeout(() => {
        setShowRequest(false);
        setRequestSent(false);
        setReason('');
      }, 2000);
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể gửi yêu cầu kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookSession = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Lỗi', 'Vui lòng chọn ngày giờ');
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    setIsSubmitting(true);
    try {
      await expertApi.bookSession(bookExpertId, scheduledAt, 45, sessionType);
      toast.success('Thành công', 'Đã đặt lịch hẹn chuyên gia');
      setShowBookSession(false);
      setActiveTab('sessions');
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể đặt lịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-centered">
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--md-sys-space-md)',
        marginBottom: 'var(--md-sys-space-xl)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        paddingBottom: 'var(--md-sys-space-sm)',
      }}>
        {[
          { id: 'discover', label: 'Khám phá Chuyên gia' },
          { id: 'connections', label: 'Kết nối của tôi' },
          { id: 'sessions', label: 'Lịch hẹn' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--md-sys-color-primary)' : '3px solid transparent',
              fontSize: 'var(--md-sys-typescale-title-small-size)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: DISCOVER */}
      {activeTab === 'discover' && (
        <div className="animate-fade-in-up">
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

          {loadingExperts ? (
            <div className="p-xl text-center">Đang tải danh sách chuyên gia...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--md-sys-space-xl)',
            }}>
              {experts.map(expert => (
                <div
                  key={expert._id}
                  onClick={() => setSelectedExpert(expert._id === selectedExpert ? null : expert._id)}
                  style={{
                    background: selectedExpert === expert._id ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-lowest)',
                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                    padding: 'var(--md-sys-space-xl)',
                    cursor: 'pointer',
                    transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                    boxShadow: 'var(--md-sys-elevation-1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-md)', marginBottom: 'var(--md-sys-space-md)' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 'var(--md-sys-shape-corner-full)',
                      background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--md-sys-typescale-headline-small-size)',
                      overflow: 'hidden'
                    }}>
                      {expert.profileImageUrl ? <img src={expert.profileImageUrl} alt={expert.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : expert.fullName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--md-sys-typescale-title-medium-size)', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                        {expert.fullName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-sm)', marginTop: 'var(--md-sys-space-xs)' }}>
                        <StarRating rating={Math.round(expert.averageRating)} />
                        <span style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                          {expert.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 'var(--md-sys-typescale-body-medium-size)', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, marginBottom: 'var(--md-sys-space-md)' }}>
                    {expert.bio}
                  </p>

                  <div style={{ display: 'flex', gap: 'var(--md-sys-space-sm)', flexWrap: 'wrap', marginBottom: 'var(--md-sys-space-md)' }}>
                    {expert.specializations.map((s, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', borderRadius: 'var(--md-sys-shape-corner-small)', fontSize: 'var(--md-sys-typescale-label-small-size)', fontWeight: 500 }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xl)', fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}><Users size={14} /> {expert.experience} năm kinh nghiệm</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-xs)' }}><MessageSquare size={14} /> {expert.totalSessions} buổi</span>
                  </div>

                  {selectedExpert === expert._id && (
                    <div className="animate-fade-in" style={{ marginTop: 'var(--md-sys-space-xl)', borderTop: `1px solid var(--md-sys-color-outline-variant)`, paddingTop: 'var(--md-sys-space-xl)' }}>
                      <h4 style={{ fontSize: 'var(--md-sys-typescale-title-small-size)', fontWeight: 500, marginBottom: 'var(--md-sys-space-sm)' }}>Bằng cấp & Chứng chỉ</h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-space-xs)', marginBottom: 'var(--md-sys-space-xl)', listStyle: 'none', padding: 0 }}>
                        <li style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-sm)' }}><Award size={14} /> Số chứng chỉ: {expert.licenseNumber}</li>
                        <li style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 'var(--md-sys-space-sm)' }}><Award size={14} /> Chuyên gia Âm ngữ Trị liệu</li>
                      </ul>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowRequest(true); }}
                        className="btn btn-primary w-full"
                      >
                        <Send size={16} /> Yêu cầu kết nối
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {experts.length === 0 && <p className="text-secondary p-xl col-span-full text-center">Chưa có chuyên gia nào được cập nhật trên hệ thống.</p>}
            </div>
          )}
        </div>
      )}

      {/* TAB: CONNECTIONS */}
      {activeTab === 'connections' && (
        <div className="animate-fade-in-up">
          {loadingConnections ? (
            <div className="p-xl text-center">Đang tải dữ liệu kết nối...</div>
          ) : connections.length === 0 ? (
            <div className="text-center p-2xl">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-space-md)' }}>🤝</div>
              <h3 className="font-semibold mb-md">Chưa có kết nối nào</h3>
              <p className="text-secondary mb-lg">Hãy tìm kiếm chuyên gia và gửi yêu cầu kết nối để nhận được sự hỗ trợ cá nhân hóa.</p>
              <button className="btn btn-primary mt-md" onClick={() => setActiveTab('discover')}>Khám phá chuyên gia</button>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {connections.map((conn: any) => (
                <div key={conn.id} className="md3-card-elevated flex gap-xl items-center flex-wrap">
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--md-sys-color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {conn.expert?.profileImageUrl ? <img src={conn.expert.profileImageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={24} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold" style={{ fontSize: 'var(--md-sys-typescale-title-small-size)' }}>{conn.expert?.fullName || 'Chuyên gia'}</div>
                    <div className="text-secondary text-sm mb-sm">{conn.expert?.specializations?.join(', ')}</div>
                    <div className="flex items-center gap-sm mt-xs">
                      <StarRating rating={Math.round(conn.expert?.averageRating || 5)} />
                      <span className="text-xs text-muted">Yêu cầu lúc: {new Date(conn.requestedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-md">
                    {conn.status === 'pending' && <span className="badge badge-warning">Đang chờ xác nhận</span>}
                    {conn.status === 'accepted' && <span className="badge badge-success">Đã kết nối</span>}
                    {conn.status === 'rejected' && <span className="badge badge-error">Đã từ chối</span>}

                    {conn.status === 'accepted' && (
                      <button 
                        className="btn btn-lime"
                        onClick={() => {
                          setBookConnectionId(conn.id);
                          setBookExpertId(conn.expert._id);
                          setShowBookSession(true);
                        }}
                      >
                        <Calendar size={16} /> Đặt lịch hẹn
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="animate-fade-in-up">
          {loadingSessions ? (
            <div className="p-xl text-center">Đang tải lịch hẹn...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-2xl">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-space-md)' }}>📅</div>
              <h3 className="font-semibold mb-md">Chưa có lịch hẹn nào</h3>
              <p className="text-secondary mb-lg">Hãy kết nối với chuyên gia và đặt lịch hẹn đầu tiên của bạn.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {sessions.map((session: any) => {
                const date = new Date(session.scheduledAt);
                const isPast = date < new Date() && session.status === 'scheduled';
                
                return (
                  <div key={session._id} className="card-dark flex gap-xl flex-wrap">
                    <div style={{ 
                      minWidth: 100, 
                      textAlign: 'center', 
                      padding: 'var(--md-sys-space-md)', 
                      background: 'rgba(255,255,255,0.1)', 
                      borderRadius: 'var(--md-sys-shape-corner-medium)' 
                    }}>
                      <div style={{ fontSize: 'var(--md-sys-typescale-headline-small-size)', fontWeight: 700, color: 'var(--md-sys-color-primary)' }}>
                        {date.getDate().toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm font-medium">Tháng {date.getMonth() + 1}</div>
                      <div className="text-xs text-muted mt-sm">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-sm mb-sm">
                        <span className="badge badge-primary">{session.sessionType === 'consultation' ? 'Tư vấn' : session.sessionType === 'therapy' ? 'Trị liệu' : 'Tái khám'}</span>
                        {session.status === 'scheduled' && !isPast && <span className="badge badge-warning">Sắp diễn ra</span>}
                        {session.status === 'completed' && <span className="badge badge-success">Đã hoàn thành</span>}
                        {session.status === 'cancelled' && <span className="badge badge-error">Đã hủy</span>}
                      </div>
                      <h3 className="font-semibold text-lg mb-xs">Phiên trị liệu với {session.expertId?.fullName || 'Chuyên gia'}</h3>
                      <div className="text-secondary text-sm mb-md flex items-center gap-md">
                        <span className="flex items-center gap-xs"><Clock size={14} /> {session.duration} phút</span>
                      </div>
                      
                      {session.status === 'scheduled' && !isPast && (
                        <div className="flex gap-md mt-md">
                          <a href={session.meetingUrl || '#'} target="_blank" rel="noreferrer" className="btn btn-lime btn-sm">
                            <Video size={16} /> Tham gia Meeting
                          </a>
                        </div>
                      )}
                      {(session.status === 'completed' || isPast) && !session.rating && (
                        <div className="flex gap-md mt-md p-md bg-white/5 rounded-md">
                          <span className="text-sm">Đánh giá phiên này:</span>
                          <StarRating rating={0} interactive onChange={(r) => toast.success('Đã lưu đánh giá', `Bạn đã đánh giá ${r} sao`)} />
                        </div>
                      )}
                      {session.rating && (
                        <div className="flex items-center gap-sm mt-md p-md bg-white/5 rounded-md">
                          <span className="text-sm">Đánh giá của bạn:</span>
                          <StarRating rating={session.rating} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Connection Request Modal */}
      {showRequest && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => !requestSent && setShowRequest(false)}>
          <div className="md3-card-elevated animate-scale-in" style={{ maxWidth: 500, width: '90%', background: 'var(--md-sys-color-surface-container-lowest)' }} onClick={e => e.stopPropagation()}>
            {requestSent ? (
              <div className="text-center" style={{ padding: 'var(--md-sys-space-xl)' }}>
                <CheckCircle size={48} color="var(--md-sys-color-primary)" style={{ margin: '0 auto var(--md-sys-space-lg)' }} />
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
                  <button className="btn btn-secondary" style={{ flex: 1 }} disabled={isSubmitting} onClick={() => setShowRequest(false)}>Hủy</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting || !reason.trim()} onClick={handleRequest}>
                    {isSubmitting ? 'Đang gửi...' : <><Send size={16} /> Gửi yêu cầu</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Book Session Modal */}
      {showBookSession && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowBookSession(false)}>
          <div className="md3-card-elevated animate-scale-in" style={{ maxWidth: 500, width: '90%', background: 'var(--md-sys-color-surface-container-lowest)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-lg">Đặt lịch hẹn</h3>
            
            <div className="form-group">
              <label className="form-label">Loại phiên</label>
              <select className="form-input" value={sessionType} onChange={(e: any) => setSessionType(e.target.value)}>
                <option value="consultation">Tư vấn ban đầu (45 phút)</option>
                <option value="therapy">Trị liệu (45 phút)</option>
                <option value="follow-up">Tái khám (30 phút)</option>
              </select>
            </div>
            
            <div className="flex gap-md mb-lg">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Ngày</label>
                <input type="date" className="form-input" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Giờ</label>
                <input type="time" className="form-input" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-md">
              <button className="btn btn-secondary" style={{ flex: 1 }} disabled={isSubmitting} onClick={() => setShowBookSession(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting} onClick={handleBookSession}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
