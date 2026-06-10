# 🎨 Material Design 3 - Visual Changes Guide

## Những Thay Đổi Trực Quan

### 🎨 Color System

#### Before (Old Design)
- Primary: `#4F46E5` (Indigo)
- Secondary: `#818CF8` (Light Indigo)
- Background: `#F3F4F6` (Gray)

#### After (MD3)
- Primary: `#415F91` (Blue)
- Secondary: `#565F71` (Muted Blue)
- Tertiary: `#705575` (Purple)
- Background: `#F9F9FF` (Off-white)

---

### 📝 Typography

#### Before
- Font Family: **Inter**
- Weights: 400, 500, 600, 700

#### After
- Font Family: **Google Sans Flex**
- Weights: Variable (1-1000)
- Full MD3 Typescale

---

### 🔲 Shape & Border Radius

#### Before
```css
Small:  4px
Medium: 8px
Large:  12px
XL:     16px
```

#### After (MD3)
```css
Extra Small: 4px
Small:       8px
Medium:      12px
Large:       16px
Extra Large: 28px ⭐ NEW
Full:        9999px (Pills)
```

**Key Change:** Cards và panels bây giờ dùng 28px corners (extra-large) thay vì 12-16px

---

### 🏗️ Layout Structure

#### Before
```
┌─────────────────────────────────┐
│  Sidebar (260px fixed)          │
│  ┌──────────────────────────┐   │
│  │ Navbar                   │   │
│  ├──────────────────────────┤   │
│  │                          │   │
│  │  Main Content Area       │   │
│  │                          │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

#### After (MD3)
```
┌───────────────────────────────────┐
│ Nav Rail │  Main Content          │
│ (96px)   │                        │
│ collapse │                        │
│   or     │                        │
│ (256px)  │                        │
│ expanded │                        │
└───────────────────────────────────┘
```

**Key Changes:**
- Sidebar → NavigationRail
- No separate Navbar
- Clean 2-column layout
- Collapsible navigation

---

## 📄 Page-by-Page Changes

### 1. LoginPage

#### Visual Changes:
- **Card**: Rounded corners 28px (was 16px)
- **Logo**: Blue primary color (was Indigo)
- **Button**: Full rounded (9999px) với elevation
- **Inputs**: MD3 focus states (primary border on focus)

#### Layout:
- Centered vertically & horizontally
- Max width 480px
- Elevation level 2 shadow

---

### 2. RegisterPage

#### Visual Changes:
- **Form Layout**: 2-column grid cho Name/Age, Password/Confirm
- **Inputs**: MD3 surface-container background
- **Card**: Extra-large corners (28px)
- **Button**: Primary filled với elevation shadow

#### Improvements:
- Better field grouping
- Consistent spacing với MD3 tokens
- Focus animations

---

### 3. ChatPage

#### Visual Changes:
- **Message Bubbles**:
  - User: Primary container background
  - Bot: Surface-container-high background
  - Border radius: 16px (large)
  
- **Input Area**:
  - Extra-large corners (28px)
  - Surface-container background
  - Send button với primary color

- **Empty State**:
  - Icon với primary color
  - Typography scale hierarchy

---

### 4. DashboardPage

#### Visual Changes:
- **Stats Cards**:
  - Surface-container-low background
  - Hover: elevation shadow appears
  - Icon containers với primary-container
  - Large border radius (16px)

- **Charts**:
  - Extra-large card corners (28px)
  - MD3 color palette
  - Surface-container-lowest background

- **Action Buttons**:
  - Primary: Filled với elevation
  - Secondary: Secondary-container
  - Ghost: Outlined với hover state

- **Milestones**:
  - Done: Primary-container background
  - Pending: Surface-container với opacity

---

### 5. ProfilePage

#### Visual Changes:
- **Profile Header Card**:
  - 88px avatar với primary-container
  - Extra-large corners (28px)
  - Stats badge với secondary-container

- **Tabs**:
  - Active: Secondary-container background
  - Inactive: Transparent với outline
  - Full rounded pills

- **Profile Tab**:
  - Grid layout cho fields
  - Edit mode với inline inputs
  - Read-only fields với surface-container-high

- **Notifications Tab**:
  - MD3 toggle switches (52x32px)
  - Expressive animation
  - Primary color when enabled

- **Privacy Tab**:
  - Action cards với proper colors
  - Error container cho delete account
  - Secondary container cho other actions

---

## 🎭 Motion & Animations

### Before
```css
transition: all 0.3s ease;
```

### After (MD3)
```css
/* Standard */
transition: all 250ms cubic-bezier(0.2, 0, 0, 1);

/* Expressive (for interactive elements) */
transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Key Feature:** Bounce effect (expressive easing) cho navigation rail, buttons, switches

---

## 🏔️ Elevation System

### Before
```css
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```

### After (MD3)
```css
/* Level 1 */
box-shadow: 0 1px 3px 1px rgba(0,0,0,0.15), 
            0 1px 2px rgba(0,0,0,0.3);

/* Level 2 */
box-shadow: 0 2px 6px 2px rgba(0,0,0,0.15), 
            0 1px 2px rgba(0,0,0,0.3);

/* Level 5 (max) */
box-shadow: 0 8px 12px 6px rgba(0,0,0,0.15), 
            0 4px 4px rgba(0,0,0,0.3);
```

**Usage:**
- Cards: Level 1
- Raised cards: Level 2
- Floating elements: Level 3
- Modals: Level 5

---

## 🎯 Component Patterns

### MD3 Button
```tsx
// Filled (Primary)
<button style={{
  background: 'var(--md-sys-color-primary)',
  color: 'var(--md-sys-color-on-primary)',
  border: 'none',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  padding: '14px 24px',
  boxShadow: 'var(--md-sys-elevation-1)',
}}>
  Action
</button>

// Outlined
<button style={{
  background: 'transparent',
  color: 'var(--md-sys-color-primary)',
  border: '1px solid var(--md-sys-color-outline)',
  borderRadius: 'var(--md-sys-shape-corner-full)',
  padding: '14px 24px',
}}>
  Action
</button>
```

### MD3 Card
```tsx
<div style={{
  background: 'var(--md-sys-color-surface-container-lowest)',
  borderRadius: 'var(--md-sys-shape-corner-extra-large)',
  padding: 'var(--md-sys-space-2xl)',
  boxShadow: 'var(--md-sys-elevation-1)',
}}>
  Content
</div>
```

### MD3 Input
```tsx
<input style={{
  padding: '12px 16px',
  fontSize: 'var(--md-sys-typescale-body-large-size)',
  color: 'var(--md-sys-color-on-surface)',
  background: 'var(--md-sys-color-surface-container)',
  border: '1px solid var(--md-sys-color-outline-variant)',
  borderRadius: 'var(--md-sys-shape-corner-small)',
  outline: 'none',
  transition: 'border-color var(--md-motion-duration-short4)',
}} />
```

---

## 📊 Surface Hierarchy

MD3 uses 5 levels of surface containers để tạo depth:

```
Level 0: Lowest   (#FFFFFF) - Highest elevation cards
Level 1: Low      (#F3F3FA) - Raised cards
Level 2: Base     (#EDEDF4) - Default cards
Level 3: High     (#E7E8EE) - Sunken elements
Level 4: Highest  (#E2E2E9) - Deeply sunken
```

**Usage in GoodViet:**
- Background: Surface (#F9F9FF)
- Cards: Surface-container-lowest
- Form inputs: Surface-container
- Read-only fields: Surface-container-high

---

## 🎨 Color Tokens Usage

### Surface Colors
```css
--md-sys-color-surface-container-lowest  /* Cards, panels */
--md-sys-color-surface-container-low     /* Hover states */
--md-sys-color-surface-container         /* Input backgrounds */
--md-sys-color-surface-container-high    /* Read-only fields */
```

### Semantic Colors
```css
--md-sys-color-primary                   /* Main actions */
--md-sys-color-primary-container         /* Soft backgrounds */
--md-sys-color-secondary-container       /* Alternative actions */
--md-sys-color-error-container           /* Error states */
```

---

## 🔍 Key Visual Differences Summary

| Aspect | Before | After (MD3) |
|--------|--------|-------------|
| Primary Color | #4F46E5 Indigo | #415F91 Blue |
| Font | Inter | Google Sans Flex |
| Card Corners | 12-16px | 28px |
| Button Style | Rounded 8px | Full rounded 9999px |
| Navigation | Fixed Sidebar | Collapsible Rail |
| Shadows | Simple | Multi-layer MD3 |
| Motion | Ease | Expressive bounce |
| Surface Levels | 2 | 5 |

---

## 🎯 Design Consistency

Tất cả pages hiện tại đều follow:
- ✅ MD3 color tokens
- ✅ MD3 typography scale
- ✅ MD3 shape system (28px cards)
- ✅ MD3 elevation shadows
- ✅ MD3 motion (expressive bounce)
- ✅ 5-level surface hierarchy

---

**Next:** Apply cùng patterns cho 3 pages còn lại (Assessment, Pathway, Expert)
