interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', label, fullPage }: LoadingSpinnerProps) {
  const sizeMap = { sm: 24, md: 40, lg: 60 };
  const spinnerSize = sizeMap[size];

  const spinner = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--md-sys-space-md)',
    }}>
      <div
        className="processing-spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `${Math.max(2, spinnerSize / 15)}px solid var(--md-sys-color-outline)`,
          borderTopColor: 'var(--md-sys-color-primary)',
        }}
      />
      {label && (
        <div style={{
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-secondary)',
          fontWeight: 500,
        }}>
          {label}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
