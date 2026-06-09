interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', label, fullPage = false }: LoadingSpinnerProps) {
  const sizeMap = { sm: 24, md: 40, lg: 64 };
  const px = sizeMap[size];

  const spinner = (
    <div
      role="status"
      aria-label={label || 'Đang tải...'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--gv-space-md, 12px)',
        padding: fullPage ? 'var(--gv-space-2xl, 48px)' : undefined,
        minHeight: fullPage ? '60vh' : undefined,
      }}
    >
      <div
        style={{
          width: px,
          height: px,
          border: `3px solid var(--gv-border, #E0E1E6)`,
          borderTopColor: 'var(--gv-black, #191A23)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {label && (
        <span style={{
          fontSize: size === 'sm' ? 'var(--gv-font-size-xs, 12px)' : 'var(--gv-font-size-sm, 14px)',
          color: 'var(--gv-text-muted, #6B6C7A)',
          fontWeight: 500,
        }}>
          {label}
        </span>
      )}
    </div>
  );

  return spinner;
}
