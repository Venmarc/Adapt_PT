# UIUX_BRIEF.md

**Project:** Momentum  
**Document Type:** UI/UX Design Brief & Visual Language Specification

This document is the single source of truth for all visual and interaction design decisions. It prevents random or inconsistent UI implementation. Every component, screen, and interaction must follow these rules.

---

## 1. Design Philosophy

**Core Feeling:** Premium, calm, motivating, and intelligent — like a high-end fitness/watch OS combined with a modern productivity tool.

**Key Influences:**
- Glassmorphism (primary aesthetic for cards, panels, and modals)
- Soft UI / Neumorphism-inspired buttons and inputs for tactile usability
- Minimalism with purposeful delight
- Strong focus on data visualization and progress

**Tone:** Confident but not aggressive. Supportive, not judgmental. Dark mode first (energy-efficient + premium feel).

**Core Principles:**
- Clarity over clutter
- Speed over decoration
- Motivation through progress visibility
- Frictionless daily use
- Accessibility as non-negotiable (WCAG 2.2 AA minimum)

---

## 2. Color Palette

**Primary Dark Mode (Default):**

- **Background:** `#0A0A0A` (near-black) or `#111111`
- **Surface / Glass Cards:** `rgba(255, 255, 255, 0.06)` with heavy blur (20-30px)
- **Borders:** `rgba(255, 255, 255, 0.08)`
- **Accent (Success/Green):** `#22C55E` (vibrant but not neon)
- **Accent Hover:** `#16A34A`
- **Warning/Amber:** `#F59E0B`
- **Danger:** `#EF4444`
- **Text Primary:** `#F1F1F1`
- **Text Secondary:** `#A3A3A3`
- **Text Muted:** `#6B7280`

**Light Mode (Secondary):**
- Background: `#F8FAFC`
- Surface: `rgba(255, 255, 255, 0.85)`
- Accent remains the same green

**Semantic Colors:**
- Habit Complete: `#22C55E`
- Partial/Streak Building: `#F59E0B`
- Missed: `#EF4444`
- Life Score High: Gradient from green to emerald

**Gradients (use sparingly):**
- Motivational accents: `linear-gradient(145deg, #22C55E, #10B981)`

---

## 3. Typography

**Font Family:**
- **Heading:** `Inter` (or `Satoshi` if available) — 500-700 weight
- **Body:** `Inter` — 400-500 weight
- **Monospace:** `JetBrains Mono` for data/numbers

**Scale:**
- H1: 32px / 2.0rem (bold)
- H2: 24px / 1.5rem
- H3: 20px / 1.25rem
- Body Large: 18px
- Body: 16px
- Small: 14px
- Tiny: 12px

**Line Heights:** 1.4–1.6  
**Letter Spacing:** Tight for headings, normal for body.

---

## 4. Glassmorphism & Layout Rules

- All major cards/panels use glassmorphism:
  - Background: `rgba(255, 255, 255, 0.06)` (dark) / `rgba(255,255,255,0.75)` (light)
  - Backdrop-filter: blur(24px)
  - Border: 1px solid `rgba(255,255,255,0.1)`
  - Border-radius: 20px (large) or 16px (medium)
- Elevated cards have subtle inner shadow + outer glow on hover
- Layout uses generous whitespace (padding 24-32px on cards)
- Sidebar: Glass panel, fixed on desktop, collapsible
- Mobile: Bottom nav with glass effect

---

## 5. Component Specifications

**Buttons:**
- Soft UI style: subtle inner shadow + gentle outer highlight
- Primary: Green accent, rounded-xl (14px), padding 14px 28px
- Secondary: Glass background, border
- Danger: Red with soft hover
- Micro buttons: Icon-only with 8px padding

**Inputs & Forms:**
- Soft UI: Subtle inset shadow for "pressed in" feel
- Background: Slightly darker glass
- Focus state: Strong green glow + border
- Labels always visible and accessible

**Progress Elements:**
- Circular progress rings (thick stroke, 8-12px)
- Linear bars with soft glow
- Habit checkboxes: Large, animated on complete

**Data Visualizations:**
- Clean lines, minimal grid
- Use accent green for positive trends
- Tooltips with glass style

**Modals:**
- Heavy glassmorphism + backdrop blur
- Centered, max-width 480px on mobile
- Smooth entrance animation (scale + fade)

---

## 6. Accessibility (Mandatory)

- Contrast ratios: Minimum 4.5:1 (text), 3:1 (UI elements)
- All interactive elements minimum 48x48px touch targets
- Full keyboard navigation
- ARIA labels on all icons and complex components
- Focus outlines visible and consistent (green glow)
- Screen reader friendly (proper heading hierarchy, alt text for photos)
- Color not the only indicator of state (use icons + text)
- Reduced motion preference respected

---

## 7. Motion & Micro-interactions

- All state changes: 200-300ms spring animations
- Habit complete: Confetti burst (subtle, short)
- Logging success: Scale + checkmark animation
- Chart interactions: Hover tooltips with glass cards
- Page transitions: Subtle fade + slide from right
- Never excessive — motion must serve clarity or delight

---

## 8. Iconography

- Use **Lucide Icons** or **Tabler Icons** (consistent stroke weight 2.0-2.5)
- Size: 20px (default), 24px (buttons), 32px (large cards)
- Consistent color usage (accent for active states)

---

## 9. Do’s and Don’ts

**Do:**
- Prioritize scanning speed on Today page
- Make progress feel addictive
- Use whitespace aggressively
- Keep daily logging extremely fast
- Test on real mobile devices

**Don’t:**
- Use too many bright colors
- Add skeuomorphic trash (heavy shadows, 3D buttons)
- Overuse animations
- Create dense screens
- Ignore mobile experience

---

## 10. Screen-Specific Guidelines

- **/today:** Clean, card-heavy, prioritized actions at top
- **Habits List:** Grid or clean list with streak flames
- **Fitness Log:** Vertical flow, large tap targets for sets
- **Insights:** Dark background with vibrant chart accents
- **Progress:** Full-bleed charts with glass overlays

**Responsive Behavior:**
- Mobile (< 768px): Bottom nav, stacked cards, larger touch targets
- Tablet: Hybrid sidebar + content
- Desktop: Full sidebar + spacious layout

---

**Maintenance Rule:**  
Any time a new component or visual pattern is introduced, update this document. Inconsistent design kills professionalism and portfolio impact.

This is your visual constitution. Enforce it strictly.
