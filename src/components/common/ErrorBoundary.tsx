import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to Sentry)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--gv-space-2xl, 48px)',
          textAlign: 'center',
          minHeight: 300,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(231,76,60,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--gv-space-lg, 24px)',
          }}>
            <AlertTriangle size={36} color="#E74C3C" />
          </div>
          <h2 style={{
            fontSize: 'var(--gv-font-size-xl, 20px)',
            fontWeight: 700,
            marginBottom: 'var(--gv-space-sm, 8px)',
          }}>
            Đã xảy ra lỗi
          </h2>
          <p style={{
            color: 'var(--gv-text-muted, #6B6C7A)',
            marginBottom: 'var(--gv-space-lg, 24px)',
            maxWidth: 400,
            lineHeight: 1.6,
          }}>
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc tải lại trang.
          </p>
          <div style={{ display: 'flex', gap: 'var(--gv-space-md, 12px)' }}>
            <button
              className="btn btn-primary"
              onClick={this.handleRetry}
            >
              <RotateCcw size={16} /> Thử lại
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
