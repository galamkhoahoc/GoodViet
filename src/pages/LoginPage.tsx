import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'var(--md-sys-color-primary)',
            borderRadius: 'var(--md-sys-shape-corner-large)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--md-sys-color-on-primary)',
            margin: '0 auto 12px'
          }}>
            G
          </div>
          <h1>GOODVIET</h1>
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--md-sys-color-on-surface-variant)', 
            marginTop: '0.5rem' 
          }}>
            Nền tảng hỗ trợ giao tiếp lời nói tiếng Việt
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--md-sys-color-error)', 
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="auth-button" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <LogIn size={18} /> Đăng nhập
          </button>
        </form>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ 
            color: 'var(--md-sys-color-primary)', 
            fontWeight: 600 
          }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
