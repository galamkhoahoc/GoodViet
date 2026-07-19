import { Check } from 'lucide-react';

const data = [
  { day: 'T2', value: 6, isTarget: false },
  { day: 'T3', value: 9, isTarget: false },
  { day: 'T4', value: 11, isTarget: true },
  { day: 'T5', value: 4, isTarget: false },
  { day: 'T6', value: 14, isTarget: true },
  { day: 'T7', value: 6, isTarget: false },
  { day: 'CN', value: 10, isTarget: true },
];

export function ExpressiveChart() {
  const maxVal = 15;
  
  return (
    <div style={{ 
      position: 'relative', 
      height: '300px', 
      display: 'flex', 
      padding: '40px 60px 20px 20px',
      background: 'var(--md-sys-color-surface-container-lowest)',
      borderRadius: '32px',
      boxShadow: 'var(--md-sys-elevation-1)'
    }}>
      
      {/* Background Y-axis & Lines */}
      <div style={{ position: 'absolute', top: '40px', bottom: '40px', left: 0, right: 0, zIndex: 0 }}>
        {/* 15k Line */}
        <div style={{ position: 'absolute', top: '0%', width: '100%' }}>
            <span style={{ position: 'absolute', right: '20px', top: '-10px', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>15k</span>
        </div>
        {/* 10k Line (Target) */}
        <div style={{ position: 'absolute', top: '33.33%', width: '100%', height: '2px', background: 'var(--md-sys-color-tertiary)', opacity: 0.3 }} >
            <span style={{ position: 'absolute', right: '20px', top: '-10px', fontSize: '12px', color: 'var(--md-sys-color-tertiary)', fontWeight: 600 }}>10k</span>
        </div>
        {/* 5k Line */}
        <div style={{ position: 'absolute', top: '66.66%', width: '100%' }}>
            <span style={{ position: 'absolute', right: '20px', top: '-10px', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>5k</span>
        </div>
        {/* 0k Line */}
        <div style={{ position: 'absolute', top: '100%', width: '100%' }}>
            <span style={{ position: 'absolute', right: '20px', top: '-10px', fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}>0k</span>
        </div>
      </div>
      
      {/* Bars Container */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        width: 'calc(100% - 60px)', 
        height: '100%',
        marginLeft: '20px'
      }}>
        {data.map((d, i) => {
          const heightPct = (d.value / maxVal) * 100;
          // In the image, non-target bars are purple (tertiary), target are green (primary)
          const color = d.isTarget ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-tertiary)'; 
          
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 1, position: 'relative', width: '12%' }}>
              
              {/* The Bar */}
              <div style={{ 
                 width: '100%', 
                 maxWidth: '56px',
                 height: `calc(${heightPct}% - 24px)`, // Subtract space for X-axis label
                 background: color, 
                 borderRadius: '999px',
                 position: 'relative',
                 display: 'flex',
                 justifyContent: 'center',
                 transition: 'height 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}>
                  {/* The Checkmark Star (if target reached) */}
                  {d.isTarget && (
                    <div className="shape-sunny" style={{
                      position: 'absolute',
                      top: '12px',
                      width: '36px',
                      height: '36px',
                      background: 'var(--md-sys-color-surface-container-lowest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.9
                    }}>
                      <Check size={18} color="var(--md-sys-color-primary)" strokeWidth={3} />
                    </div>
                  )}
              </div>
  
              {/* X-axis Label */}
              <span style={{ 
                height: '24px', 
                display: 'flex', 
                alignItems: 'flex-end', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: 'var(--md-sys-color-on-surface-variant)' 
              }}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
