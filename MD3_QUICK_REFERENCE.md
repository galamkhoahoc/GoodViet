# 🎨 Material Design 3 - Quick Reference Guide

## Hướng Dẫn Sử Dụng MD3 Design System

Tài liệu này cung cấp quick reference cho việc implement MD3 trong GoodViet.

---

## 🎨 Color Tokens

### Primary Colors
```css
/* Primary - Blue */
--md-sys-color-primary: #415F91;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-primary-container: #D6E3FF;
--md-sys-color-on-primary-container: #284777;
```

### Secondary Colors
```css
/* Secondary - Muted Blue */
--md-sys-color-secondary: #565F71;
--md-sys-color-on-secondary: #FFFFFF;
--md-sys-color-secondary-container: #DAE2F9;
--md-sys-color-on-secondary-container: #3E4759;
```

### Tertiary Colors
```css
/* Tertiary - Purple */
--md-sys-color-tertiary: #705575;
--md-sys-color-on-tertiary: #FFFFFF;
--md-sys-color-tertiary-container: #FAD8FD;
--md-sys-color-on-tertiary-container: #573E5C;
```

### Surface Colors (5-Level Hierarchy)
```css
--md-sys-color-surface: #F9F9FF;
--md-sys-color-on-surface: #191C20;
--md-sys-color-surface-container-lowest: #FFFFFF;    /* Cards */
--md-sys-color-surface-container-low: #F3F3FA;       /* Hover */
--md-sys-color-surface-container: #EDEDF4;           /* Inputs */
--md-sys-color-surface-container-high: #E7E8EE;      /* Read-only */
--md-sys-color-surface-container-highest: #E2E2E9;   /* Deep */
```

### Semantic Colors
```css
--md-sys-color-error: #BA1A1A;
--md-sys-color-error-container: #FFDAD6;
--md-sys-color-outline: #74777F;
--md-sys-color-outline-variant: #C4C6D0;
```

---

## 📝 Typography Scale

```css
/* Display */
--md-sys-typescale-display-large-size: 57px;
--md-sys-typescale-display-medium-size: 45px;
--md-sys-typescale-display-small-size: 36px;

/* Headline */
--md-sys-typescale-headline-large-size: 32px;
--md-sys-typescale-headline-medium-size: 28px;
--md-sys-typescale-headline-small-size: 24px;

/* Title */
--md-sys-typescale-title-large-size: 22px;
--md-sys-typescale-title-medium-size: 16px;
--md-sys-typescale-title-small-size: 14px;

/* Body */
--md-sys-typescale-body-large-size: 16px;
--md-sys-typescale-body-medium-size: 14px;
--md-sys-typescale-body-small-size: 12px;

/* Label */
--md-sys-typescale-label-large-size: 14px;
--md-sys-typescale-label-medium-size: 12px;
--md-sys-typescale-label-small-size: 11px;

/* Font Family */
--md-sys-typescale-font: "Google Sans Flex", sans-serif;
```

---

## 🔲 Shape System

```css
--md-sys-shape-corner-none: 0;
--md-sys-shape-corner-extra-small: 4px;
--md-sys-shape-corner-small: 8px;
--md-sys-shape-corner-medium: 12px;
--md-sys-shape-corner-large: 16px;
--md-sys-shape-corner-extra-large: 28px;  /* ⭐ Cards */
--md-sys-shape-corner-full: 9999px;        /* ⭐ Buttons */
```

**Usage:**
- **Cards/Panels:** `extra-large` (28px)
- **Buttons:** `full` (9999px)
- **Inputs:** `small` (8px)
- **Badges:** `full` (9999px)

---

## 🏔️ Elevation System

```css
--md-sys-elevation-0: none;
--md-sys-elevation-1: 0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3);
--md-sys-elevation-2: 0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3);
--md-sys-elevation-3: 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3);
--md-sys-elevation-4: 0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3);
--md-sys-elevation-5: 0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3);
```

**Usage:**
- **Level 1:** Normal cards
- **Level 2:** Hover/raised cards
- **Level 3:** Floating elements
- **Level 5:** Modals

---

## ⏱️ Motion System

```css
/* Duration */
--md-motion-duration-short4: 200ms;
--md-motion-duration-medium2: 300ms;
--md-motion-duration-medium4: 400ms;

/* Easing */
--md-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--md-motion-easing-expressive: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce */
```

**Usage:**
- **Standard:** Normal transitions
- **Expressive:** Interactive elements (buttons, switches)

---

## 📏 Spacing System

```css
--md-sys-space-xs: 4px;
--md-sys-space-sm: 8px;
--md-sys-space-md: 12px;
--md-sys-space-lg: 16px;
--md-sys-space-xl: 24px;
--md-sys-space-2xl: 32px;
--md-sys-space-3xl: 48px;
--md-sys-space-4xl: 64px;
```

---

## 🎯 Component Patterns

### MD3 Card
```tsx
<div style={{
  background: 'var(--md-sys-color-surface-container-lowest)',
  borderRadius: 'var(--md-sys-shape-corner-extra-large)',
  padding: 'var(--md-sys-space-xl)',
  boxShadow: 'var(--md-sys-elevation-1)',
}}>
  {/* Content */}
</div>
```

### MD3 Button - Filled (Primary)
```tsx
<button style={{
  padding: '14px 24px',
  background: 'var(--md-sys-color-primary)',
  color: 'var(--md-sys-color-on-primary)',
  border: 'none',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  fontSize: 'var(--md-sys-typescale-label-large-size)',
  fontWeight: 500,
  cursor: 'pointer',
  boxShadow: 'var(--md-sys-elevation-1)',
  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
}}>
  Action
</button>
```

### MD3 Button - Outlined
```tsx
<button style={{
  padding: '14px 24px',
  background: 'transparent',
  color: 'var(--md-sys-color-primary)',
  border: '1px solid var(--md-sys-color-outline)',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  fontSize: 'var(--md-sys-typescale-label-large-size)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
}}>
  Action
</button>
```

### MD3 Button - Text
```tsx
<button style={{
  padding: '14px 24px',
  background: 'transparent',
  color: 'var(--md-sys-color-primary)',
  border: 'none',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  fontSize: 'var(--md-sys-typescale-label-large-size)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
}}>
  Action
</button>
```

### MD3 Input Field
```tsx
<input style={{
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
/>
```

### MD3 Badge/Chip
```tsx
<span style={{
  padding: '6px 16px',
  background: 'var(--md-sys-color-secondary-container)',
  color: 'var(--md-sys-color-on-secondary-container)',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  fontSize: 'var(--md-sys-typescale-label-small-size)',
  fontWeight: 500,
}}>
  Label
</span>
```

### MD3 Progress Bar
```tsx
<div style={{
  height: 8,
  background: 'var(--md-sys-color-surface-container-high)',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  overflow: 'hidden',
}}>
  <div style={{
    height: '100%',
    width: '60%', // Progress percentage
    background: 'var(--md-sys-color-primary)',
    borderRadius: 'var(--md-sys-shape-corner-full)',
    transition: 'width var(--md-motion-duration-medium2) var(--md-motion-easing-standard)',
  }} />
</div>
```

### MD3 Toggle Switch
```tsx
<label style={{
  position: 'relative',
  width: 52,
  height: 32,
  cursor: 'pointer',
  display: 'block',
}}>
  <input
    type="checkbox"
    checked={isEnabled}
    onChange={(e) => setIsEnabled(e.target.checked)}
    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
  />
  <span style={{
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--md-sys-shape-corner-full)',
    background: isEnabled ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
    transition: 'background var(--md-motion-duration-short4) var(--md-motion-easing-standard)',
  }}>
    <span style={{
      position: 'absolute',
      top: 4,
      left: isEnabled ? 24 : 4,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--md-sys-color-surface-container-highest)',
      boxShadow: 'var(--md-sys-elevation-1)',
      transition: 'left var(--md-motion-duration-short4) var(--md-motion-easing-expressive)',
    }} />
  </span>
</label>
```

---

## 🎭 Hover & Focus States

### Hover Effect
```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)';
  e.currentTarget.style.transform = 'translateY(-1px)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)';
  e.currentTarget.style.transform = 'translateY(0)';
}}
```

### Focus Effect (Input)
```tsx
onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
onBlur={(e) => e.target.style.borderColor = 'var(--md-sys-color-outline-variant)'}
```

---

## 📱 Responsive Layout

### Grid Layout
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--md-sys-space-xl)',
}}>
  {/* Items */}
</div>
```

### Flex Layout
```tsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--md-sys-space-md)',
}}>
  {/* Items */}
</div>
```

---

## ✅ Best Practices

### DO ✅
- Use MD3 design tokens (CSS custom properties)
- Use semantic color names (primary, secondary, etc.)
- Use MD3 shape tokens for consistent corners
- Apply elevation for hierarchy
- Use expressive motion for interactive elements
- Maintain 5-level surface hierarchy

### DON'T ❌
- Don't hardcode colors (#415F91 ❌)
- Don't hardcode sizes (28px ❌)
- Don't use simple `ease` transitions
- Don't mix old and new design systems
- Don't ignore surface hierarchy

---

## 🔍 Common Patterns

### Page Container
```tsx
<div style={{ padding: 'var(--md-sys-space-2xl)' }}>
  {/* Page content */}
</div>
```

### Page Header
```tsx
<div style={{ marginBottom: 'var(--md-sys-space-2xl)' }}>
  <h1 style={{
    fontSize: 'var(--md-sys-typescale-headline-medium-size)',
    fontWeight: 700,
    color: 'var(--md-sys-color-on-surface)',
    marginBottom: 'var(--md-sys-space-xs)',
  }}>
    Title
  </h1>
  <p style={{
    fontSize: 'var(--md-sys-typescale-body-large-size)',
    color: 'var(--md-sys-color-on-surface-variant)',
  }}>
    Subtitle
  </p>
</div>
```

### Section Spacing
```tsx
style={{ marginBottom: 'var(--md-sys-space-xl)' }}
```

---

## 🎨 Color Usage Guidelines

### Text Colors
- **Primary Text:** `--md-sys-color-on-surface`
- **Secondary Text:** `--md-sys-color-on-surface-variant`
- **On Primary:** `--md-sys-color-on-primary`
- **On Container:** `--md-sys-color-on-primary-container`

### Background Colors
- **Page Background:** `--md-sys-color-surface`
- **Card Background:** `--md-sys-color-surface-container-lowest`
- **Input Background:** `--md-sys-color-surface-container`
- **Hover Background:** `--md-sys-color-surface-container-low`

### Accent Colors
- **Primary Actions:** `--md-sys-color-primary`
- **Secondary Actions:** `--md-sys-color-secondary-container`
- **Error States:** `--md-sys-color-error-container`
- **Success:** Use primary with green semantics

---

## 📚 References

- [Material Design 3](https://m3.material.io/)
- [Color System](https://m3.material.io/styles/color/overview)
- [Typography](https://m3.material.io/styles/typography/overview)
- [Shape](https://m3.material.io/styles/shape/overview)
- [Motion](https://m3.material.io/styles/motion/overview)
- [Elevation](https://m3.material.io/styles/elevation/overview)

---

**Last Updated:** 10/06/2026  
**GoodViet MD3 Version:** 1.0
