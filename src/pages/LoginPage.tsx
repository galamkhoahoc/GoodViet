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
    <div className="min-h-screen flex items-center justify-center p-10 bg-gradient-to-br from-[#fdfdf5] to-[#f5f5eb]">
      <div className="w-full max-w-[1200px] h-[819px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side: Login Form */}
        <div className="w-[540px] p-16 flex flex-col">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">G</span>
              </div>
              <h1 className="text-[1.75rem] font-bold text-gray-900">GoodViet</h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-[2.5rem] font-bold text-gray-900 mb-3">Đăng nhập</h2>
              <p className="text-gray-600">để tiếp tục đến không gian của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email hoặc username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-base"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="pt-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Cần hỗ trợ?</p>
                  <p className="text-sm text-gray-600">
                    Nếu quên mật khẩu, vui lòng liên hệ giáo viên của bạn để được cấp lại tài khoản.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
                  >
                    Tiếp tục
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 tracking-wider">
              MỘT DỰ ÁN CỦA PHÚ QUÝ & TCG SCIENCE
            </p>
          </div>
        </div>

        {/* Right Side: Decorative Illustration */}
        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
          {/* Abstract Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-[447px] h-[447px] border-4 border-emerald-500 rounded-full"></div>
            <div className="absolute w-[298px] h-[298px] border-4 border-emerald-400 rounded-full"></div>
            <div className="absolute w-[149px] h-[149px] border-4 border-emerald-300 rounded-full"></div>
          </div>
          
          {/* Decorative dots */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-teal-400 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-teal-300 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
}
