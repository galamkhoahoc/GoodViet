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
    <div className="min-h-screen flex items-center justify-center p-8 relative w-full font-plus-jakarta bg-gradient-to-r from-[#f2f5eb] to-white">
      <div className="bg-white flex isolate items-start max-w-[1200px] min-h-[600px] h-[819px] overflow-hidden relative rounded-[24px] shadow-lg w-full shrink-0">
        
        {/* Left Side: Login Form Area */}
        <div className="flex flex-col h-full items-start justify-between py-16 px-16 relative shrink-0 w-[540px] z-10">
          
          {/* Logo */}
          <div className="flex flex-col items-start pb-8 w-full shrink-0">
            <div className="flex gap-2 items-center w-full">
              <div className="h-6 w-7 bg-[#205107] rounded flex items-center justify-center">
                 <span className="text-white text-sm font-bold">G</span>
              </div>
              <div className="flex flex-col font-bold justify-center text-[#191d17] text-[22px]">
                <p>GoodViet</p>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 items-start justify-center max-w-[448px] w-full relative">
            
            <div className="flex flex-col items-start pb-10 w-full shrink-0">
              <div className="flex flex-col gap-2 items-start w-full">
                <div className="font-semibold text-[#191d17] text-[32px] leading-tight">
                  <p>Đăng nhập</p>
                </div>
                <div className="font-normal text-[#42493c] text-sm tracking-wide">
                  <p>để tiếp tục đến không gian của bạn.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-start pb-4 w-full shrink-0">
              <div className="flex flex-col gap-6 items-start w-full shrink-0">
                
                <div className="flex flex-col gap-4 items-start w-full shrink-0">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Email hoặc username"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-white border border-[#c3c8bc] text-[#191d17] text-sm px-[17px] py-[14px] rounded-xl w-full focus:outline-none focus:border-[#205107] transition-colors"
                    />
                  </div>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-white border border-[#c3c8bc] text-[#191d17] text-sm pl-[17px] pr-[49px] py-[14px] rounded-xl w-full focus:outline-none focus:border-[#205107] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute bottom-0 right-0 top-0 flex items-center justify-center pr-[17px] text-[#72796b] hover:text-[#191d17] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-start pt-2 w-full shrink-0">
                  <div className="font-semibold text-[#191d17] text-xs tracking-wide">
                    <p>Cần hỗ trợ?</p>
                  </div>
                  <div className="font-normal text-[#42493c] text-sm tracking-wide leading-relaxed">
                    <p>Nếu quên mật khẩu, vui lòng liên hệ giáo viên của bạn để được cấp lại tài khoản.</p>
                  </div>
                </div>

                {error && (
                  <div className="w-full bg-[#ffdad6] border border-[#ba1a1a] rounded-xl p-3 text-sm text-[#410002]">
                    {error}
                  </div>
                )}

                <div className="flex items-start justify-end pt-4 w-full shrink-0">
                  <button 
                    type="submit"
                    className="bg-[#205107] hover:bg-[#173c05] transition-colors flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium shadow-sm"
                  >
                    Tiếp tục <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </form>
          </div>

          {/* Footer Attribution */}
          <div className="flex flex-col items-start pt-8 w-full shrink-0 border-t border-[#e0e4da]/50 mt-4">
            <div className="font-normal text-[#72796b] text-[10px] tracking-wider uppercase">
              <p>MỘT DỰ ÁN CỦA PHÚ QUÝ & TCG SCIENCE</p>
            </div>
          </div>
        </div>

        {/* Right Side: Decorative Illustration Area */}
        <div className="bg-[#f2f5eb] flex flex-col h-full items-start justify-center overflow-hidden relative shrink-0 w-[660px] z-0">
          <div className="flex-1 w-full min-h-px flex items-center justify-center p-8 opacity-80 mix-blend-multiply relative">
            <svg
              className="absolute w-[80%] h-[80%]"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="200" cy="200" r="120" stroke="#205107" strokeWidth="2" opacity="0.3" />
              <circle cx="200" cy="200" r="80" stroke="#386666" strokeWidth="2" opacity="0.4" />
              <circle cx="200" cy="200" r="40" stroke="#205107" strokeWidth="2" opacity="0.5" />
              
              <path d="M150 180 L200 140 L250 180" stroke="#205107" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              <path d="M160 220 L240 220" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <path d="M170 240 L230 240" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <path d="M180 260 L220 260" stroke="#386666" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              
              <circle cx="120" cy="120" r="4" fill="#205107" opacity="0.5" />
              <circle cx="280" cy="130" r="5" fill="#386666" opacity="0.4" />
              <circle cx="300" cy="280" r="3" fill="#205107" opacity="0.6" />
              <circle cx="100" cy="290" r="4" fill="#386666" opacity="0.5" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
