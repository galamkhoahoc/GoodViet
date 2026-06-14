import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { 
      setError('Vui lòng điền đầy đủ thông tin'); 
      return; 
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (!success) {
      setError('Email hoặc mật khẩu không đúng. Hãy đăng ký nếu chưa có tài khoản.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
           <span className="material-symbols-outlined text-[40px]">communication</span>
        </div>
        <h2 className="mt-6 text-center text-display-sm font-display-sm font-bold text-on-surface tracking-tight">
          Chào mừng trở lại
        </h2>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Đăng nhập để tiếp tục hành trình của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-lowest py-8 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] organic-curve border border-outline-variant/20 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-label-md font-medium text-on-surface mb-2">
                Địa chỉ Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-outline-variant/50 rounded-xl shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-low text-on-surface"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-label-md font-medium text-on-surface mb-2">
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-outline-variant/50 rounded-xl shadow-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-low text-on-surface"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="w-full bg-error-container border border-error rounded-xl p-3 text-sm text-on-error-container">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-body-sm text-on-surface-variant">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-body-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-label-lg font-medium text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-lowest text-on-surface-variant">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-outline-variant/30 rounded-xl shadow-sm bg-surface-lowest text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-outline-variant/30 rounded-xl shadow-sm bg-surface-lowest text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <img className="h-5 w-5" src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
