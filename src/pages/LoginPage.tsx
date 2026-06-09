import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Vui lòng điền đầy đủ thông tin'); return; }
    const success = login(email, password);
    if (!success) setError('Email hoặc mật khẩu không đúng. Hãy đăng ký nếu chưa có tài khoản.');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar-logo-icon" style={{ width: 56, height: 56, fontSize: '1.5rem', margin: '0 auto 12px' }}>G</div>
          <h1>GOODVIET</h1>
          <p>Nền tảng hỗ trợ giao tiếp lời nói tiếng Việt</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-input" placeholder="example@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full">
            <LogIn size={18} /> Đăng nhập
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
