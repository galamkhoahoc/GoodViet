# ✅ Material Design 3 Migration Checklist

## For Future Pages or Components

Use this checklist when creating new pages or components with MD3 design.

---

## 🎨 Design Tokens

### Colors
- [ ] Use `--md-sys-color-primary` instead of hardcoded colors
- [ ] Use `--md-sys-color-on-primary` for text on primary background
- [ ] Use `--md-sys-color-surface-container-lowest` for cards
- [ ] Use `--md-sys-color-surface-container` for input backgrounds
- [ ] Use semantic color tokens (error, secondary, tertiary)

### Typography
- [ ] Use Google Sans Flex font: `--md-sys-typescale-font`
- [ ] Use MD3 typescale for sizes: `--md-sys-typescale-body-large-size`
- [ ] Use appropriate font weights (400, 500, 700)
- [ ] Apply correct line-heights from typescale

### Shape
- [ ] Use `--md-sys-shape-corner-extra-large` (28px) for cards
- [ ] Use `--md-sys-shape-corner-full` (9999px) for buttons
- [ ] Use `--md-sys-shape-corner-small` (8px) for inputs
- [ ] Use `--md-sys-shape-corner-large` (16px) for medium elements

### Elevation
- [ ] Apply `--md-sys-elevation-1` for normal cards
- [ ] Apply `--md-sys-elevation-2` for hover states
- [ ] Apply `--md-sys-elevation-3` for floating elements
- [ ] No elevation for flush surfaces

### Spacing
- [ ] Use MD3 spacing tokens: `--md-sys-space-xl`, `--md-sys-space-lg`, etc.
- [ ] Consistent spacing between sections
- [ ] Proper padding inside cards (usually `--md-sys-space-xl`)

### Motion
- [ ] Use `--md-motion-duration-short4` (200ms) for quick transitions
- [ ] Use `--md-motion-duration-medium2` (300ms) for standard transitions
- [ ] Use `--md-motion-easing-standard` for normal animations
- [ ] Use `--md-motion-easing-expressive` for interactive elements (bounce)

---

## 🧩 Component Structure

### Page Layout
- [ ] Container with `padding: var(--md-sys-space-2xl)`
- [ ] Page header with title and subtitle
- [ ] Title: `--md-sys-typescale-headline-medium-size`
- [ ] Subtitle: `--md-sys-typescale-body-large-size`
- [ ] Consistent section spacing

### Cards
- [ ] Background: `--md-sys-color-surface-container-lowest`
- [ ] Border radius: `--md-sys-shape-corner-extra-large`
- [ ] Padding: `--md-sys-space-xl`
- [ ] Shadow: `--md-sys-elevation-1`
- [ ] Hover state with elevation increase

### Buttons
- [ ] **Filled (Primary):**
  - Background: `--md-sys-color-primary`
  - Color: `--md-sys-color-on-primary`
  - Border: none
  - Border radius: `--md-sys-shape-corner-full`
  - Shadow: `--md-sys-elevation-1`
  
- [ ] **Outlined:**
  - Background: transparent
  - Color: `--md-sys-color-primary`
  - Border: `1px solid var(--md-sys-color-outline)`
  - Border radius: `--md-sys-shape-corner-full`
  
- [ ] **Text:**
  - Background: transparent
  - Color: `--md-sys-color-primary`
  - Border: none
  - Border radius: `--md-sys-shape-corner-full`

### Input Fields
- [ ] Padding: `12px 16px`
- [ ] Background: `--md-sys-color-surface-container`
- [ ] Border: `1px solid var(--md-sys-color-outline-variant)`
- [ ] Border radius: `--md-sys-shape-corner-small`
- [ ] Focus state: border color changes to primary
- [ ] Font size: `--md-sys-typescale-body-large-size`

### Badges/Chips
- [ ] Padding: `6px 16px` (small) or `8px 20px` (medium)
- [ ] Background: `--md-sys-color-secondary-container`
- [ ] Color: `--md-sys-color-on-secondary-container`
- [ ] Border radius: `--md-sys-shape-corner-full`
- [ ] Font size: `--md-sys-typescale-label-small-size`
- [ ] Font weight: 500

---

## 🎭 Interactive States

### Hover States
- [ ] Elevation increase (1 → 2)
- [ ] Optional transform: `translateY(-1px)`
- [ ] Smooth transition: `var(--md-motion-duration-short4)`
- [ ] Background color change for buttons

### Focus States
- [ ] Border color change to primary
- [ ] Outline ring (optional)
- [ ] Smooth transition

### Active States
- [ ] Different background color
- [ ] Different text color
- [ ] Optional indicator (pill, underline)

### Disabled States
- [ ] Reduced opacity (0.38)
- [ ] Cursor: not-allowed
- [ ] No hover effects

---

## 📱 Responsive Design

### Grid Layouts
- [ ] Use `repeat(auto-fit, minmax(300px, 1fr))`
- [ ] Consistent gap: `var(--md-sys-space-xl)`
- [ ] Mobile-friendly minimum width

### Flex Layouts
- [ ] Use flex with proper gap
- [ ] Wrap items on mobile
- [ ] Align items appropriately

### Mobile Considerations
- [ ] Touch-friendly hit areas (min 44x44px)
- [ ] Scrollable containers for overflow
- [ ] Responsive font sizes
- [ ] Stack layouts on small screens

---

## ♿ Accessibility

### Semantic HTML
- [ ] Use proper heading hierarchy (h1, h2, h3)
- [ ] Use semantic elements (nav, main, section, article)
- [ ] Proper form labels
- [ ] Button vs link usage

### ARIA Labels
- [ ] Add aria-label for icon-only buttons
- [ ] Add aria-labelledby for sections
- [ ] Add aria-describedby for form hints
- [ ] Add role attributes where needed

### Keyboard Navigation
- [ ] Tab order makes sense
- [ ] Focus visible on all interactive elements
- [ ] Enter/Space triggers buttons
- [ ] Escape closes modals

### Color Contrast
- [ ] Text passes WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Focus indicators are visible
- [ ] Don't rely on color alone

---

## 🔍 Code Quality

### TypeScript
- [ ] Proper types for props
- [ ] No `any` types
- [ ] Type-safe event handlers
- [ ] Interface definitions for complex objects

### React Best Practices
- [ ] Use functional components
- [ ] Proper hooks usage (useState, useEffect, etc.)
- [ ] Avoid inline function definitions in loops
- [ ] Memoize expensive computations

### Style Consistency
- [ ] Use inline styles with CSS variables
- [ ] Consistent naming conventions
- [ ] Group related styles together
- [ ] Comment complex styles

### Performance
- [ ] Avoid unnecessary re-renders
- [ ] Optimize images
- [ ] Lazy load heavy components
- [ ] Use transitions wisely

---

## 📝 Documentation

### Component Documentation
- [ ] Add JSDoc comments for props
- [ ] Document complex logic
- [ ] Include usage examples
- [ ] Note any breaking changes

### Code Comments
- [ ] Explain "why" not "what"
- [ ] Document edge cases
- [ ] Mark TODOs clearly
- [ ] Keep comments up-to-date

---

## ✨ Animation Guidelines

### Transition Properties
- [ ] Specify which properties animate
- [ ] Use appropriate duration
- [ ] Use correct easing function
- [ ] Avoid `transition: all` in production

### Animation Timing
- [ ] Micro-interactions: 100-200ms
- [ ] Component transitions: 250-400ms
- [ ] Page transitions: 450-600ms
- [ ] Never over 1 second

### Motion Preferences
- [ ] Respect prefers-reduced-motion
- [ ] Provide alternative feedback
- [ ] Essential animations only

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on different screen sizes
- [ ] Test dark mode (if applicable)
- [ ] Test with different zoom levels

### Functional Testing
- [ ] All buttons work
- [ ] All forms submit correctly
- [ ] All links navigate properly
- [ ] Error states display correctly

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus management is correct
- [ ] Color contrast passes

### Performance Testing
- [ ] Page loads quickly
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks
- [ ] Images are optimized

---

## 📋 Before Commit Checklist

- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No TODO comments (or tracked in issues)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Code is formatted
- [ ] Git commit message is clear
- [ ] Changes are documented

---

## 🎯 Quality Standards

### Visual Quality
- ✅ Follows MD3 design system
- ✅ Consistent with other pages
- ✅ No visual bugs or glitches
- ✅ Smooth animations

### Code Quality
- ✅ Clean and readable
- ✅ Properly typed
- ✅ Well-structured
- ✅ Reusable components

### User Experience
- ✅ Intuitive interface
- ✅ Fast and responsive
- ✅ Accessible to all users
- ✅ Error handling

---

## 📚 Additional Resources

### Design References
- [Material Design 3](https://m3.material.io/)
- [Component Gallery](https://m3.material.io/components)
- [Design Tokens](https://m3.material.io/foundations/design-tokens)

### Code Examples
- See existing pages: LoginPage, DashboardPage, ProfilePage
- Review NavigationRail component
- Check MD3_QUICK_REFERENCE.md

### Tools
- [Figma MD3 Kit](https://www.figma.com/community/file/1035203688168086460)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)

---

**Remember:** Consistency is key! Follow existing patterns and use MD3 tokens throughout.

**Last Updated:** 10/06/2026
