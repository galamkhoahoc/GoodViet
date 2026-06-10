# 🎨 GoodViet UI Redesign - Chatbot PhoBERT Inspired

## Tổng quan
Đã xây dựng lại toàn bộ giao diện GoodViet dựa trên thiết kế UI/UX của repo `chatbot_phobert`, chuyển từ Positivus style (Lime/Black) sang Clean Modern style (Indigo/Purple).

## ✨ Thay đổi chính

### 1. **Design System mới (index.css)**

#### Color Palette
- **Primary Color**: `#4F46E5` (Indigo) - thay thế cho Lime (`#B9FF66`)
- **Secondary Color**: `#818CF8` (Light Indigo)
- **Background**: `#F3F4F6` (Light Gray)
- **Text**: `#1F2937` (Dark Gray)
- **Borders**: `#E5E7EB` (Light Border)

#### Typography
- **Font Family**: Inter (Google Fonts) - thay thế Google Sans local
- **Font Weights**: 400, 500, 600, 700
- **Clean & professional look**

#### Spacing & Sizing
- Sidebar: 260px
- Navbar: 60px
- Border radius: 4px, 8px, 12px, 16px
- Consistent spacing scale

### 2. **Component Styling Updates**

#### Buttons
- ✅ Rounded corners (8px) thay vì pill-shaped (full radius)
- ✅ Subtle borders (1px) thay vì bold (2px)
- ✅ Hover effects mượt mà không có offset shadow
- ✅ Primary button: Indigo background
- ✅ Secondary button: White with border

#### Cards
- ✅ Subtle shadows thay vì offset shadow style
- ✅ 1px borders thay vì 2px
- ✅ Cleaner, less "brutalist" aesthetic
- ✅ Smooth hover animations

#### Forms
- ✅ Simpler input styling
- ✅ Focus state với primary color
- ✅ Subtle box-shadow khi focus

#### Badges
- ✅ Soft background colors
- ✅ Color-coded semantic badges
- ✅ Smaller padding

### 3. **Chat Interface**

#### Chat Bubbles
- ✅ User messages: Indigo background (`#4F46E5`)
- ✅ Bot messages: Light gray background (`#E5E7EB`)
- ✅ Rounded corners với asymmetric bottom corners
- ✅ Avatar circles với Indigo background

#### Chat Container
- ✅ Clean white background
- ✅ Subtle border and shadow
- ✅ Professional appearance

### 4. **Dashboard Updates**

#### Stats Cards
- ✅ Soft background colors thay vì bold colors
- ✅ Icon với primary/secondary colors
- ✅ Clean borders

#### Charts
- ✅ Indigo line color thay vì black
- ✅ Light Indigo bars thay vì lime
- ✅ Cleaner grid lines
- ✅ Subtle tooltips

#### Milestones
- ✅ Primary-soft background cho completed items
- ✅ Green checkmarks
- ✅ Better visual hierarchy

### 5. **Layout Components**

#### Sidebar
- ✅ Indigo logo icon thay vì lime
- ✅ Active link: Primary-soft background
- ✅ Subtle hover effects
- ✅ User avatar: Indigo background

#### Navbar
- ✅ Clean notification dropdown
- ✅ Primary-soft background cho unread notifications
- ✅ Hover effects

### 6. **Auth Pages**

#### Login & Register
- ✅ Clean card design
- ✅ Subtle shadows
- ✅ Primary color accents
- ✅ Professional look

### 7. **Animations**

#### New/Updated Animations
- ✅ `wave-bar` - cho typing indicator
- ✅ `fadeInDown` - cho dropdowns
- ✅ `scaleIn` - cho modals
- ✅ Smooth transitions throughout

## 📁 Files Modified

### CSS
- ✅ `src/index.css` - Complete redesign với new design system

### Components
- ✅ `src/components/layout/Navbar.tsx` - Updated notification dropdown
- ✅ `src/components/common/LoadingSpinner.tsx` - New component

### Pages
- ✅ `src/pages/ChatPage.tsx` - Updated chat UI với Indigo theme
- ✅ `src/pages/DashboardPage.tsx` - Updated charts và stats
- ✅ `src/pages/LoginPage.tsx` - Already clean (no changes needed)
- ✅ `src/pages/RegisterPage.tsx` - Already clean (no changes needed)

## 🎯 Design Principles

### Chatbot PhoBERT Style
1. **Clean & Professional** - Không quá "brutalist" như Positivus
2. **Indigo/Purple Theme** - Màu chủ đạo tin cậy và chuyên nghiệp
3. **Subtle Effects** - Shadows và borders nhẹ nhàng
4. **Consistent Spacing** - Sử dụng spacing scale nhất quán
5. **Modern Typography** - Inter font cho readability tốt

### Color Usage
- **Primary (Indigo)**: Buttons, links, active states, important elements
- **Secondary (Light Indigo)**: Charts, accents, hover states
- **Gray Scale**: Text, borders, backgrounds
- **Semantic Colors**: Success (Green), Error (Red), Warning (Orange), Info (Blue)

## 🚀 Next Steps

### Các trang cần cập nhật (nếu cần)
- [ ] AssessmentPage - Cập nhật progress indicators
- [ ] PathwayPage - Cập nhật pathway cards
- [ ] ExpertPage - Cập nhật expert cards
- [ ] ProfilePage - Cập nhật profile forms

### Components bổ sung (optional)
- [ ] Modal component theo style mới
- [ ] Dropdown component
- [ ] Toast notification component
- [ ] Empty state illustrations

## 📝 Notes

- Toàn bộ design system đã được cập nhật để match với chatbot_phobert
- Các components tái sử dụng CSS classes từ index.css
- Animations mượt mà và consistent
- Responsive design được giữ nguyên
- Accessibility được maintain

## 🎨 Color Reference

```css
/* Primary Colors */
--gv-primary: #4F46E5;
--gv-primary-hover: #4338CA;
--gv-primary-light: #818CF8;
--gv-primary-soft: rgba(79, 70, 229, 0.1);

/* Neutrals */
--gv-black: #1F2937;
--gv-text: #1F2937;
--gv-text-secondary: #6B7280;
--gv-text-muted: #9CA3AF;

/* Backgrounds */
--gv-bg: #F3F4F6;
--gv-bg-surface: #FFFFFF;
--gv-border: #E5E7EB;

/* Semantic */
--gv-success: #10B981;
--gv-error: #EF4444;
--gv-warning: #F59E0B;
--gv-info: #3B82F6;
```

---

**Status**: ✅ Core UI Redesign Complete
**Date**: 2026-06-10
**Designer**: Kiro AI Assistant
