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

    if (!form.name || !form.email || !form.password) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc'); return;
    }

    // Validate age if provided
    if (form.age) {
      const age = parseInt(form.age);
      if (age < 18 || age > 100) { setError('Tuổi phải từ 18 đến 100'); return; }
    }
    
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }

    // Prepare payload - only send what backend expects
    const payload: any = {
      fullName: form.name,
      email: form.email,
      password: form.password,
    };
    
    // Add optional fields if provided
    if (form.phone && form.phone.trim()) {
      payload.phoneNumber = form.phone;
    }
    
    if (form.age) {
      payload.age = parseInt(form.age);
    }
    
    // Store speechDescription in targetGoals field (backend accepts this)
    if (form.speechDescription) {
      payload.targetGoals = form.speechDescription;
    }

    console.log('Register payload:', payload); // DEBUG

    const success = await registerFn(payload);

    if (!success) setError('Đăng ký thất bại (email có thể đã được sử dụng hoặc dữ liệu không hợp lệ)');
  };

  return (
    <div className="auth-page" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--md-sys-color-surface)',
      padding: 'var(--md-sys-space-xl)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 540,
        background: 'var(--md-sys-color-surface-container-lowest)',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--md-sys-space-3xl)',
        boxShadow: 'var(--md-sys-elevation-2)',
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--md-sys-space-2xl)' }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto var(--md-sys-space-md)',
            background: 'var(--md-sys-color-primary)',
            borderRadius: 'var(--md-sys-shape-corner-large)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--md-sys-typescale-headline-medium-size)',
            fontWeight: 700,
            color: 'var(--md-sys-color-on-primary)',
          }}>
            G
          </div>
          <h1 style={{
            fontSize: 'var(--md-sys-typescale-headline-small-size)',
            fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 'var(--md-sys-space-xs)',
          }}>
            Tạo tài khoản
          </h1>
          <p style={{
            fontSize: 'var(--md-sys-typescale-body-medium-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}>
            Bắt đầu hành trình cải thiện giọng nói
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--md-sys-space-lg)' }}>
            <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-xs)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>Họ và tên *</label>
              <input
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface)',
                  background: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  outline: 'none',
                  transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-xs)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>Tuổi</label>
              <input
                type="number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface)',
                  background: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  outline: 'none',
                  transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
                placeholder="25"
                min={18}
                max={100}
                value={form.age}
                onChange={e => update('age', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--md-sys-space-xs)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>Email *</label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface)',
                background: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                outline: 'none',
                transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
              placeholder="email@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--md-sys-space-xs)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>Số điện thoại</label>
            <input
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface)',
                background: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                outline: 'none',
                transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
              placeholder="0901234567"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--md-sys-space-lg)' }}>
            <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-xs)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>Mật khẩu *</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface)',
                  background: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  outline: 'none',
                  transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 'var(--md-sys-space-lg)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--md-sys-space-xs)',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                fontWeight: 500,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>Xác nhận mật khẩu *</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
                  color: 'var(--md-sys-color-on-surface)',
                  background: 'var(--md-sys-color-surface-container)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  borderRadius: 'var(--md-sys-shape-corner-small)',
                  outline: 'none',
                  transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--md-sys-space-xl)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--md-sys-space-xs)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>Mô tả khó khăn về giọng nói</label>
            <textarea
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
                color: 'var(--md-sys-color-on-surface)',
                background: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                outline: 'none',
                minHeight: 80,
                resize: 'vertical',
                fontFamily: 'var(--md-sys-typescale-font)',
                transition: 'border-color var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
              placeholder="Ví dụ: Tôi hay nhầm lẫn giữa L và N, nói hơi nhanh khi trình bày trước đám đông..."
              value={form.speechDescription}
              onChange={e => update('speechDescription', e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: 'var(--md-sys-space-lg)',
              background: 'var(--md-sys-color-error-container)',
              color: 'var(--md-sys-color-on-error-container)',
              borderRadius: 'var(--md-sys-shape-corner-small)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              fontSize: 'var(--md-sys-typescale-label-large-size)',
              fontWeight: 'var(--md-sys-typescale-label-large-weight)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--md-sys-space-sm)',
              transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
              boxShadow: 'var(--md-sys-elevation-1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <UserPlus size={18} /> Đăng ký
          </button>
        </form>

        <div style={{
          marginTop: 'var(--md-sys-space-xl)',
          textAlign: 'center',
          fontSize: 'var(--md-sys-typescale-body-medium-size)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{
            color: 'var(--md-sys-color-primary)',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
