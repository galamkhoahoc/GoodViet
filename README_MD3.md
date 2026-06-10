# 🎨 GoodViet - Material Design 3 Edition

## Overview

GoodViet là ứng dụng web hỗ trợ cải thiện giọng nói, được redesign hoàn toàn với **Material Design 3** design system.

---

## ✨ Features

### 🎙️ Core Features
- **GOODVIET Check** - Bài test sàng lọc giọng nói 3 giai đoạn
- **Practice Pathway** - Lộ trình luyện tập theo tuần
- **Expert Connection** - Kết nối với chuyên gia
- **Progress Tracking** - Theo dõi tiến độ học tập
- **AI Chat Assistant** - Trợ lý AI hỗ trợ luyện tập

### 🎨 Design Features
- Material Design 3 design system
- Google Sans Flex typography
- Expressive bounce animations
- 5-level surface hierarchy
- Collapsible navigation rail
- Responsive grid layouts

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd GLKH-GoodViet

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:5173/
```

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Structure

```
GLKH-GoodViet/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── NavigationRail.tsx  # MD3 navigation
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx           # ✅ MD3
│   │   ├── RegisterPage.tsx        # ✅ MD3
│   │   ├── ChatPage.tsx            # ✅ MD3
│   │   ├── DashboardPage.tsx       # ✅ MD3
│   │   ├── ProfilePage.tsx         # ✅ MD3
│   │   ├── AssessmentPage.tsx      # ✅ MD3
│   │   ├── PathwayPage.tsx         # ✅ MD3
│   │   └── ExpertPage.tsx          # ✅ MD3
│   ├── styles/
│   │   ├── md3-tokens.css          # MD3 design tokens
│   │   ├── md3-components.css      # Component styles
│   │   ├── m3-motion.css           # Animations
│   │   ├── m3-containers.css       # Surface hierarchy
│   │   ├── navigation-rail.css     # Navigation
│   │   ├── shapes.css              # Custom shapes
│   │   ├── modal.css               # Dialogs
│   │   ├── tabs.css                # Tabs system
│   │   └── index.css               # Main entry
│   └── index.css                   # App styles
│
├── docs/                            # Documentation
│   ├── REDESIGN_COMPLETE.md
│   ├── MD3_IMPLEMENTATION_COMPLETE.md
│   ├── MD3_VISUAL_CHANGES.md
│   ├── MD3_FINAL_SUMMARY.md
│   ├── MD3_QUICK_REFERENCE.md
│   ├── MD3_MIGRATION_CHECKLIST.md
│   └── PROJECT_STATUS.md
│
└── package.json
```

---

## 🎨 Design System

### Color Palette
```css
Primary:   #415F91 (Blue)
Secondary: #565F71 (Muted Blue)
Tertiary:  #705575 (Purple)
```

### Typography
- **Font:** Google Sans Flex
- **Scale:** MD3 typescale (Display, Headline, Title, Body, Label)

### Shape
- **Cards:** 28px corners (extra-large)
- **Buttons:** Full rounded (9999px)
- **Inputs:** 8px corners (small)

### Elevation
- 5-level shadow system
- From flush surfaces to modal overlays

### Motion
- Standard easing for normal transitions
- Expressive bounce for interactive elements
- 200-600ms duration range

---

## 📱 Pages

### 1. Login Page
- Centered auth card
- MD3 input fields
- Primary action button

### 2. Register Page
- Grid form layout (2 columns)
- Validation states
- Focus animations

### 3. Chat Page
- Message bubbles (user/bot)
- Input area with send button
- Empty state

### 4. Dashboard Page
- Stats cards with icons
- Charts (line & bar)
- Quick action buttons
- Progress milestones

### 5. Profile Page
- 3 tabs (Profile, Notifications, Privacy)
- Inline editing
- Toggle switches
- Security actions

### 6. Assessment Page
- 3-phase test flow
- Progress stepper
- Recording interface
- Results display

### 7. Pathway Page
- Weekly plan navigation
- Daily exercises
- Progress tracking
- Video integration

### 8. Expert Page
- Expert cards grid
- Expandable details
- Rating display
- Connection request

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State:** Zustand
- **Icons:** Lucide React
- **Charts:** Recharts

### Design
- **System:** Material Design 3
- **Font:** Google Sans Flex
- **Tokens:** CSS Custom Properties

---

## 📚 Documentation

### Quick Start
- **REDESIGN_COMPLETE.md** - User-facing summary
- **PROJECT_STATUS.md** - Current status

### Technical
- **MD3_IMPLEMENTATION_COMPLETE.md** - Implementation details
- **MD3_QUICK_REFERENCE.md** - Developer reference

### Design
- **MD3_VISUAL_CHANGES.md** - Visual changes guide
- **MD3_MIGRATION_CHECKLIST.md** - Migration checklist

### Completion
- **MD3_FINAL_SUMMARY.md** - Comprehensive summary

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
  Content
</div>
```

### MD3 Button
```tsx
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
```

### MD3 Input
```tsx
<input style={{
  background: 'var(--md-sys-color-surface-container)',
  border: '1px solid var(--md-sys-color-outline-variant)',
  borderRadius: 'var(--md-sys-shape-corner-small)',
  padding: '12px 16px',
}}
onFocus={(e) => e.target.style.borderColor = 'var(--md-sys-color-primary)'}
/>
```

---

## 🔧 Development

### Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment
- Dev server: http://localhost:5173/
- Hot reload enabled
- TypeScript strict mode

---

## 🌟 Key Features

### NavigationRail
- Collapsible (96px/256px)
- FAB button for quick actions
- Active state indicators
- User profile section

### Surface Hierarchy
- 5 container levels
- Proper elevation
- Consistent depth

### Interactive States
- Hover elevations
- Focus indicators
- Active highlights
- Smooth transitions

### Responsive Design
- Auto-fit grid layouts
- Flexible containers
- Mobile-friendly
- Touch-optimized

---

## 📖 API

### Design Tokens
All MD3 design tokens available via CSS custom properties:
- Colors: `--md-sys-color-*`
- Typography: `--md-sys-typescale-*`
- Shape: `--md-sys-shape-corner-*`
- Elevation: `--md-sys-elevation-*`
- Motion: `--md-motion-*`
- Spacing: `--md-sys-space-*`

See `MD3_QUICK_REFERENCE.md` for complete list.

---

## 🤝 Contributing

### Adding New Components
1. Use MD3 design tokens
2. Follow existing patterns
3. Document props with JSDoc
4. Add to style guide

### Code Style
- TypeScript strict mode
- Functional components
- Inline styles with CSS variables
- Consistent naming

See `MD3_MIGRATION_CHECKLIST.md` for detailed guidelines.

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

- **Material Design 3** by Google
- **chatbot_phobert** repository for design reference
- **Google Sans Flex** font
- **Lucide** icon library

---

## 📞 Support

For questions or issues:
- Check documentation in `/docs`
- Review `MD3_QUICK_REFERENCE.md`
- See `MD3_MIGRATION_CHECKLIST.md`

---

## 🎉 Status

✅ **100% Complete**  
✅ **8/8 Pages Redesigned**  
✅ **Production Ready**  

---

**Built with ❤️ using Material Design 3**
