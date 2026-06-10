# 🎨 GOODVIET - Material Design 3 Migration Plan

## Tổng Quan Dự Án
Migration toàn bộ giao diện GoodViet từ custom CSS sang Material Design 3, thừa kế thiết kế UI/UX từ chatbot_phobert.

**Nguồn thiết kế:** `D:\PROJECT\GLKH-GoodViet\chatbot_phobert`  
**Target:** Toàn bộ frontend GoodViet với 8 pages + layouts

---

## 📋 Kế Hoạch Thực Hiện

### Phase 1: Setup Material Design 3 System ✅
- [ ] Tạo file `src/styles/md3-tokens.css` - Design tokens từ chatbot_phobert
- [ ] Tạo file `src/styles/md3-components.css` - Component styles
- [ ] Tạo file `src/styles/md3-motion.css` - Animation system
- [ ] Tạo file `src/styles/navigation-rail.css` - Navigation rail component
- [ ] Update `src/index.css` - Import MD3 styles

### Phase 2: Layout Components (Navigation Rail + Header)
- [ ] `src/components/layout/NavigationRail.tsx` - MD3 navigation rail (thay Sidebar)
- [ ] `src/components/layout/ConversationsPanel.tsx` - Chat history panel
- [ ] `src/components/layout/Header.tsx` - MD3 header với avatar
- [ ] `src/components/layout/Layout.tsx` - Update với MD3 layout

### Phase 3: Authentication Pages
- [ ] `src/pages/LoginPage.tsx` - MD3 auth design
- [ ] `src/pages/RegisterPage.tsx` - MD3 auth design

### Phase 4: Main Application Pages
- [ ] `src/pages/DashboardPage.tsx` - MD3 cards + stats
- [ ] `src/pages/ChatPage.tsx` - Full MD3 chat interface
- [ ] `src/pages/AssessmentPage.tsx` - MD3 stepper + cards
- [ ] `src/pages/PathwayPage.tsx` - MD3 tabs + progress
- [ ] `src/pages/ExpertPage.tsx` - MD3 list + cards
- [ ] `src/pages/ProfilePage.tsx` - MD3 settings panel

### Phase 5: Common Components
- [ ] `src/components/common/Button.tsx` - MD3 button variants
- [ ] `src/components/common/Card.tsx` - MD3 elevated cards
- [ ] `src/components/common/Input.tsx` - MD3 text fields
- [ ] `src/components/common/Badge.tsx` - MD3 chips
- [ ] `src/components/common/Modal.tsx` - MD3 dialog
- [ ] `src/components/common/Toast.tsx` - MD3 snackbar

### Phase 6: Testing & Polish
- [ ] Cross-browser testing
- [ ] Responsive design verification
- [ ] Animation polish
- [ ] Accessibility check
- [ ] Performance optimization

---

## 🎨 Material Design 3 Specifications

### Color Palette (Seed: #769CDF)
```css
--md-sys-color-primary: #415F91;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-primary-container: #D6E3FF;
--md-sys-color-on-primary-container: #284777;

--md-sys-color-secondary: #565F71;
--md-sys-color-on-secondary: #FFFFFF;
--md-sys-color-secondary-container: #DAE2F9;

--md-sys-color-tertiary: #705575;
--md-sys-color-tertiary-container: #FAD8FD;

--md-sys-color-surface: #F9F9FF;
--md-sys-color-surface-container-lowest: #FFFFFF;
--md-sys-color-surface-container-low: #F3F3FA;
--md-sys-color-surface-container: #EDEDF4;
--md-sys-color-surface-dim: #D9D9E0;

--md-sys-color-error: #BA1A1A;
--md-sys-color-on-error: #FFFFFF;
```

### Typography (Google Sans Flex)
```css
--md-sys-typescale-body-large-size: 16px;
--md-sys-typescale-body-medium-size: 14px;
--md-sys-typescale-body-small-size: 12px;
--md-sys-typescale-label-large-size: 14px;
--md-sys-typescale-title-medium-size: 16px;
--md-sys-typescale-title-large-size: 22px;
--md-sys-typescale-headline-small-size: 24px;
```

### Shape System
```css
--md-sys-shape-corner-extra-small: 4px;
--md-sys-shape-corner-small: 8px;
--md-sys-shape-corner-medium: 12px;
--md-sys-shape-corner-large: 16px;
--md-sys-shape-corner-extra-large: 28px;
--md-sys-shape-corner-full: 9999px;
```

### Motion (Expressive)
```css
--md-motion-easing-expressive: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce */
--md-motion-easing-expressive-soft: cubic-bezier(0.22, 1.15, 0.36, 1);
--md-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
--md-motion-duration-short: 150ms;
--md-motion-duration-medium: 250ms;
--md-motion-duration-long: 400ms;
```

---

## 🏗️ Component Mapping

| Current (GoodViet) | New (MD3) | Description |
|--------------------|-----------|-------------|
| `.app-sidebar` | `.navigation-rail` | Left navigation (collapsed 96px, expanded 256px) |
| `.app-navbar` | `.chat-header` | Top header bar |
| `.card-positivus` | `.md3-card-elevated` | Elevated card with shadow |
| `.btn-primary` | `.md3-button-filled` | Filled button |
| `.btn-secondary` | `.md3-button-outlined` | Outlined button |
| `.btn-ghost` | `.md3-button-text` | Text button |
| `.form-input` | `.md3-text-field` | Text input field |
| `.badge` | `.md3-chip` | Chip/badge component |
| Toast | Snackbar | Bottom notification |
| `.chat-bubble` | `.message-bubble` | Chat message style |

---

## 📐 Layout Structure

### 3-Column Layout
```
┌─────────────────────────────────────────────────────────┐
│  Nav Rail  │  Conversations Panel  │  Main Content      │
│   96px     │       360px           │    Flexible        │
│            │                       │                    │
│  [Menu]    │  [Search]  [Avatar]   │  [Header]          │
│  [FAB]     │  ─────────────────    │  ─────────────     │
│            │  [Conv 1]             │  [Content Area]    │
│  [Chat]    │  [Conv 2]             │                    │
│  [Stats]   │  [Conv 3]             │                    │
│  [Info]    │  ...                  │                    │
│  [Settings]│                       │  [Input Area]      │
│            │                       │                    │
│  [Profile] │                       │                    │
└─────────────────────────────────────────────────────────┘
```

### Navigation Rail States
- **Collapsed:** 96px width, icon + label (vertical)
- **Expanded:** 256px width, icon + label (horizontal)
- **FAB:** 56x56px, primary-container background
- **Active Indicator:** pill shape (56x32px collapsed, hugs content expanded)

---

## 🎯 Key Features to Implement

### 1. Navigation Rail (MD3 Spec)
- Expandable/collapsible (menu button)
- FAB for "New Chat"
- 4 main destinations: Chat, Stats, Info, Settings
- Active state with pill indicator
- Badge support for notifications
- User profile at bottom

### 2. Conversations Panel
- Search bar at top
- Avatar button (right side)
- Scrollable conversation list
- Active conversation highlight
- Star/favorite functionality
- Time stamps

### 3. Chat Interface
- Tab system: Chat, Explore, Info, Settings
- Message bubbles (user: primary, bot: surface-container-high)
- Empty state with icon
- Scroll to bottom button
- Auto-resizing textarea
- Watermark background (HCMUS logo with opacity)

### 4. Expressive Motion
- Bounce animations on expand/collapse
- Fade in/out transitions
- Smooth scroll behavior
- Loading states
- Hover effects

### 5. Material Elevation
- Surface hierarchy (0-2)
- Shadow system (1-3)
- Card elevation on hover
- FAB elevation

---

## 📝 Implementation Notes

### CSS Architecture
```
src/styles/
├── md3-tokens.css          # Design tokens (colors, typography, shape)
├── md3-components.css      # Component styles (cards, buttons, inputs)
├── md3-motion.css          # Animation system
├── navigation-rail.css     # Navigation rail component
├── m3-containers.css       # Surface hierarchy
├── shapes.css              # Custom shapes (cookie, etc.)
└── index.css               # Main entry (imports all)
```

### Component Props
```typescript
// NavigationRail.tsx
interface NavigationRailProps {
  expanded: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

// MD3Button.tsx
interface MD3ButtonProps {
  variant: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Animation Tokens
```css
/* Expressive (bounce) */
--md-motion-easing-expressive: cubic-bezier(0.34, 1.56, 0.64, 1);
--md-motion-easing-expressive-soft: cubic-bezier(0.22, 1.15, 0.36, 1);

/* Emphasized (smooth) */
--md-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
--md-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
```

---

## ✅ Success Criteria

1. **Visual Consistency:** All pages follow MD3 design language
2. **Responsive Design:** Works on desktop, tablet, mobile
3. **Accessibility:** ARIA labels, keyboard navigation, focus states
4. **Performance:** Smooth animations, no layout shifts
5. **Code Quality:** Type-safe TypeScript, reusable components
6. **User Experience:** Intuitive navigation, clear feedback

---

## 🚀 Getting Started

```bash
# 1. Backup current styles
cp src/index.css src/index.css.backup

# 2. Create MD3 styles directory
mkdir -p src/styles

# 3. Copy MD3 files from chatbot_phobert
cp chatbot_phobert/static/css/style.css src/styles/md3-tokens.css
cp chatbot_phobert/static/css/navigation-rail.css src/styles/navigation-rail.css
cp chatbot_phobert/static/css/m3-containers.css src/styles/m3-containers.css
cp chatbot_phobert/static/css/m3-motion.css src/styles/m3-motion.css
cp chatbot_phobert/static/css/shapes.css src/styles/shapes.css

# 4. Start implementation
npm run dev
```

---

## 📚 Resources

- [Material Design 3](https://m3.material.io/)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)
- [Google Fonts - Google Sans Flex](https://fonts.google.com/specimen/Google+Sans+Flex)
- [Chatbot PhoBERT Source](file:///d:/PROJECT/GLKH-GoodViet/chatbot_phobert/)

---

## 🎉 Expected Result

Một ứng dụng GoodViet hoàn toàn mới với:
- ✨ Thiết kế Material Design 3 hiện đại
- 🎨 Color palette nhất quán (#415F91 primary)
- 🔄 Animation mượt mà với expressive motion
- 📱 Responsive design hoàn hảo
- ♿ Accessibility chuẩn WCAG
- 🚀 Performance tối ưu

---

**Timeline:** 2-3 ngày  
**Status:** Phase 1 - Setup in progress  
**Last Updated:** ${new Date().toLocaleDateString('vi-VN')}
