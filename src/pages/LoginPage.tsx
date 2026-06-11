import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { 
      setError('Vui lòng điền đầy đủ thông tin'); 
      return; 
    }
    const success = await login(email, password);
    if (!success) {
      setError('Email hoặc mật khẩu không đúng. Hãy đăng ký nếu chưa có tài khoản.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      background: '#f2f5eb',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: '1200px',
        height: '819px',
        maxWidth: '100%',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Left Side: Login Form */}
        <div style={{
          width: '540px',
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '24.375px',
                height: '27.5px',
                background: '#205107',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700
                }}>G</span>
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#191d17',
                margin: 0
              }}>GoodViet</h1>
            </div>
          </div>

          {/* Form Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#191d17',
                lineHeight: '40px',
                margin: 0,
                marginBottom: '8px'
              }}>Đăng nhập</h2>
              <p style={{
                fontSize: '14px',
                color: '#42493c',
                letterSpacing: '0.25px',
                margin: 0
              }}>để tiếp tục đến không gian của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <input
                  type="email"
                  placeholder="Email hoặc username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 17px',
                    border: '1px solid #c3c8bc',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                    color: '#191d17',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#205107'}
                  onBlur={(e) => e.target.style.borderColor = '#c3c8bc'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 49px 14px 17px',
                    border: '1px solid #c3c8bc',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                    color: '#191d17',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#205107'}
                  onBlur={(e) => e.target.style.borderColor = '#c3c8bc'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '17px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#72796b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ paddingTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#191d17',
                    margin: 0,
                    marginBottom: '4px'
                  }}>Cần hỗ trợ?</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#42493c',
                    lineHeight: '20px',
                    margin: 0
                  }}>
                    Nếu quên mật khẩu, vui lòng liên hệ giáo viên của bạn để được cấp lại tài khoản.
                  </p>
                </div>

                {error && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#ffdad6',
                    border: '1px solid #ba1a1a',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#410002'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="submit"
                    style={{
                      padding: '13px 25px',
                      background: '#205107',
                      color: 'white',
                      borderRadius: '9999px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0px 1px 1px rgba(0,0,0,0.05)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#173c05'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#205107'}
                  >
                    Tiếp tục
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid #e0e4da'
          }}>
            <p style={{
              fontSize: '10px',
              textAlign: 'center',
              color: '#72796b',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              margin: 0
            }}>
              MỘT DỰ ÁN CỦA PHÚ QUÝ & TCG SCIENCE
            </p>
          </div>
        </div>

        {/* Right Side: Decorative Illustration */}
        <div style={{
          flex: 1,
          width: '660px',
          background: '#f2f5eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Abstract educational pattern with circles and lines */}
          <svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              opacity: 0.8,
              mixBlendMode: 'multiply'
            }}
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Decorative circles */}
            <circle cx="200" cy="200" r="120" stroke="#205107" strokeWidth="2" opacity="0.3" />
            <circle cx="200" cy="200" r="80" stroke="#386666" strokeWidth="2" opacity="0.4" />
            <circle cx="200" cy="200" r="40" stroke="#205107" strokeWidth="2" opacity="0.5" />
            
            {/* Book/Learning iconography */}
            <path d="M150 180 L200 140 L250 180" stroke="#205107" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M160 220 L240 220" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <path d="M170 240 L230 240" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <path d="M180 260 L220 260" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            
            {/* Decorative dots */}
            <circle cx="120" cy="120" r="4" fill="#205107" opacity="0.5" />
            <circle cx="280" cy="130" r="5" fill="#386666" opacity="0.4" />
            <circle cx="300" cy="280" r="3" fill="#205107" opacity="0.6" />
            <circle cx="100" cy="290" r="4" fill="#386666" opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
