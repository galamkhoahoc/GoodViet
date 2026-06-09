import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  const registerFn = useAuthStore(s => s.register);
  const [form, setForm] = useState({ name: '', email: '', age: '', password: '', confirmPassword: '', phone: '', speechDescription: '' });
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.age || !form.password || !form.speechDescription) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc'); return;
    }

    const age = parseInt(form.age);
    if (age < 22 || age > 55) { setError('Tuổi phải từ 22 đến 55'); return; }
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }

    const success = await registerFn({
      fullName: form.name, email: form.email, age,
      phone: form.phone || undefined,
      speechDescription: form.speechDescription,
      password: form.password,
    });

    if (!success) setError('Đăng ký thất bại (email có thể đã được sử dụng)');
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div className="sidebar-logo-icon" style={{ width: 56, height: 56, fontSize: '1.5rem', margin: '0 auto 12px' }}>G</div>
          <h1>Tạo tài khoản</h1>
          <p>Bắt đầu hành trình cải thiện giọng nói</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tuổi (22-55) *</label>
              <input type="number" className="form-input" placeholder="30" min={22} max={55} value={form.age} onChange={e => update('age', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-input" placeholder="0901234567" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input type="password" className="form-input" placeholder="Tối thiểu 8 ký tự" value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <input type="password" className="form-input" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả khó khăn về giọng nói *</label>
            <textarea
              className="form-textarea" placeholder="Ví dụ: Tôi hay nhầm lẫn giữa L và N, nói hơi nhanh khi trình bày trước đám đông..."
              value={form.speechDescription} onChange={e => update('speechDescription', e.target.value)}
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full">
            <UserPlus size={18} /> Đăng ký
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
