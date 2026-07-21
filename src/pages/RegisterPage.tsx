import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { User } from '../data/mockUsers';
import '../styles/login-page.css';
import '../styles/register-page.css';

interface RegisterForm {
  name: string;
  email: string;
  age: string;
  password: string;
  confirmPassword: string;
  phone: string;
  speechDescription: string;
}

const EMPTY_FORM: RegisterForm = {
  name: '',
  email: '',
  age: '',
  password: '',
  confirmPassword: '',
  phone: '',
  speechDescription: '',
};

export function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    const age = form.age ? Number.parseInt(form.age, 10) : undefined;
    if (age !== undefined && (age < 18 || age > 100)) {
      setError('Tuổi phải từ 18 đến 100.');
      return;
    }
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const payload: Partial<User> & { password: string } = {
      fullName: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      ...(form.phone.trim() ? { phoneNumber: form.phone.trim() } : {}),
      ...(age !== undefined ? { age } : {}),
      ...(form.speechDescription.trim() ? { targetGoals: form.speechDescription.trim() } : {}),
    };

    setIsLoading(true);
    const success = await register(payload);
    setIsLoading(false);
    if (!success) setError('Không thể tạo tài khoản. Email có thể đã được sử dụng hoặc dữ liệu chưa hợp lệ.');
  };

  return (
    <main className="gv-login gv-register">
      <section className="gv-login__card gv-register__card" aria-labelledby="register-title">
        <div className="gv-login__form-panel gv-register__form-panel">
          <Link className="gv-login__brand" to="/login" aria-label="GoodViet">
            <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
            <strong>GoodViet</strong>
          </Link>

          <div className="gv-register__form-wrap">
            <header className="gv-login__heading gv-register__heading">
              <h1 id="register-title">Tạo tài khoản</h1>
              <p>Bắt đầu hành trình luyện giọng được thiết kế riêng cho bạn.</p>
            </header>

            <form className="gv-register__form" onSubmit={handleSubmit} noValidate>
              <div className="gv-register__grid">
                <label className="gv-register__field">
                  <span>Họ và tên *</span>
                  <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" />
                </label>
                <label className="gv-register__field">
                  <span>Tuổi</span>
                  <input type="number" min={18} max={100} value={form.age} onChange={(event) => update('age', event.target.value)} placeholder="25" inputMode="numeric" />
                </label>
                <label className="gv-register__field">
                  <span>Email *</span>
                  <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="email@example.com" autoComplete="email" />
                </label>
                <label className="gv-register__field">
                  <span>Số điện thoại</span>
                  <input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="0901 234 567" autoComplete="tel" />
                </label>
                <label className="gv-register__field">
                  <span>Mật khẩu *</span>
                  <input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" />
                </label>
                <label className="gv-register__field">
                  <span>Xác nhận mật khẩu *</span>
                  <input type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Nhập lại mật khẩu" autoComplete="new-password" />
                </label>
                <label className="gv-register__field gv-register__field--wide">
                  <span>Mục tiêu luyện tập</span>
                  <textarea value={form.speechDescription} onChange={(event) => update('speechDescription', event.target.value)} placeholder="Ví dụ: Tôi muốn nói rõ âm L/N và tự tin hơn khi thuyết trình..." rows={3} />
                </label>
              </div>

              {error && <p className="gv-login__error" role="alert"><span className="material-symbols-outlined" aria-hidden="true">error</span>{error}</p>}

              <div className="gv-register__form-footer">
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                <button className="gv-login__submit gv-register__submit" type="submit" disabled={isLoading}>
                  {isLoading ? <><span className="material-symbols-outlined gv-login__spinner">progress_activity</span> Đang tạo</> : <>Tạo tài khoản <ArrowRight size={17} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="gv-register__art-panel" aria-label="Lợi ích khi sử dụng GoodViet">
          <div className="gv-register__art-copy">
            <span className="gv-register__art-icon"><UserPlus size={25} /></span>
            <p className="gv-register__art-eyebrow"><ShieldCheck size={15} /> Không gian luyện tập riêng tư</p>
            <h2>Một lộ trình phù hợp với chính giọng nói của bạn.</h2>
            <p>Thông tin bạn cung cấp giúp GoodViet đề xuất bài học sát mục tiêu hơn và lưu tiến độ xuyên suốt hành trình.</p>
            <ul>
              <li><CheckCircle2 size={17} /> Đánh giá giọng nói bằng AI</li>
              <li><CheckCircle2 size={17} /> Bài luyện và mục tiêu cá nhân hóa</li>
              <li><CheckCircle2 size={17} /> Kết nối trợ lý và chuyên gia khi cần</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
