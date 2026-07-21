import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import '../styles/login-page.css';

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    const success = await login(email.trim(), password);
    setIsLoading(false);

    if (!success) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại.');
    }
  };

  return (
    <main className="gv-login">
      <section className="gv-login__card" aria-labelledby="login-title">
        <div className="gv-login__form-panel">
          <div className="gv-login__brand" aria-label="GoodViet">
            <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
            <strong>GoodViet</strong>
          </div>

          <div className="gv-login__form-wrap">
            <header className="gv-login__heading">
              <h1 id="login-title">Đăng nhập</h1>
              <p>Để tiếp tục đến không gian của bạn.</p>
            </header>

            <form className="gv-login__form" onSubmit={handleLogin} noValidate>
              <div className="gv-login__field">
                <label htmlFor="login-email">Email hoặc tên đăng nhập</label>
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email hoặc username"
                  aria-invalid={Boolean(error)}
                />
              </div>

              <div className="gv-login__field gv-login__password-field">
                <label htmlFor="login-password">Mật khẩu</label>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mật khẩu"
                  aria-invalid={Boolean(error)}
                />
                <button
                  className="gv-login__visibility"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>

              {error && (
                <p className="gv-login__error" role="alert">
                  <span className="material-symbols-outlined" aria-hidden="true">error</span>
                  {error}
                </p>
              )}

              <div className="gv-login__help">
                <strong>Cần hỗ trợ?</strong>
                <p>Nếu quên mật khẩu, vui lòng liên hệ qua email galamkhoahoc@gmail.com để được hỗ trợ.</p>
              </div>

              <button className="gv-login__submit" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined gv-login__spinner" aria-hidden="true">progress_activity</span>
                    Đang xử lý
                  </>
                ) : (
                  <>
                    Tiếp tục
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="gv-login__credit">Một dự án của nhóm nghiên cứu Gà làm khoa học</p>
        </div>

        <div className="gv-login__art-panel" aria-hidden="true">
          <div className="gv-login__orbit gv-login__orbit--outer">
            <span className="gv-login__shape gv-login__shape--sparkle">✦</span>
            <span className="gv-login__shape gv-login__shape--diamond" />
            <span className="gv-login__shape gv-login__shape--triangle" />
            <span className="gv-login__shape gv-login__shape--star">✧</span>
            <div className="gv-login__orbit gv-login__orbit--inner">
              <div className="gv-login__orbit gv-login__orbit--core">
                <span className="material-symbols-outlined gv-login__book">auto_stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
