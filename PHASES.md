et's# PHASES.md

Detailed development phases for **Momentum** (Habit/Fitness/Wellness Tracker).

This document breaks down every phase with clear deliverables, success criteria, estimated effort, and ruthless warnings.

---

## Phase 0: Foundation (1-3 days)

**Goal:** Rock-solid base that everything else builds on. No half-assed setup.

**Deliverables:**
- Full project scaffolding (Next.js 15+ App Router recommended, TypeScript strict mode).
- Authentication system (Clerk or Supabase Auth) with protected routes.
- Database setup + initial SCHEMA.md fully implemented and migrated.
- Basic layout: Sidebar/desktop nav + mobile bottom nav, theme provider (dark default), responsive container.
- Global error boundary, toast system, loading skeletons.
- Basic protected dashboard shell.
- ESLint + Prettier + TypeScript config locked down.
- Initial seeding script for realistic test data.

**Success Criteria:**
- Can register/login and land on a clean dashboard.
- Zero console errors or hydration mismatches.
- All routes properly guarded.
- Design tokens and basic component library started.

**Warnings:**
- Fuck up auth or DB now and you’ll pay for it in every later phase. Do it properly.

---

## Phase 1: Core Logging (5-8 days)

**Goal:** Make daily use frictionless. This is the heart of the app.

**Deliverables:**
- Habits module: CRUD, flexible recurrence logic (daily, weekdays, X/week, custom intervals), quick log with notes + rating.
- Fitness logger: Exercise library (searchable), log sets/reps/weight/time/RPE, rest timer.
- Wellness quick logger: Mood, energy, sleep, simple journal entry.
- Unified "Today" dashboard with due habits, planned workout, wellness snapshot.
- Basic history views per module.

**Success Criteria:**
- Full daily logging loop under 20 seconds.
- Data persists correctly and shows up immediately (optimistic updates).
- Mobile experience is excellent.
- All core forms have proper validation (client + server).

**Warnings:**
- If logging feels slow or clunky → project is already trash. Prioritize speed and simplicity here.

---

## Phase 2: Progress & Visualization (7-10 days)

**Goal:** Turn raw data into motivating progress.

**Deliverables:**
- Detailed history + calendar views with heatmaps (GitHub style).
- Multiple chart types: adherence trends, strength progression, volume, mood over time (Recharts or Tremor).
- Body measurements tracker + photo upload timeline.
- Personal Records (PRs) detection for lifts.
- Exercise progress graphs (1RM estimates, etc.).
- Filtering and date range selection.

**Success Criteria:**
- Charts are insightful and beautiful on both mobile and desktop.
- Performance stays excellent with 6+ months of seeded data.
- All visualizations update in real-time after logging.

**Warnings:**
- Generic charts = boring portfolio piece. Make them actually useful or don’t bother.

---

## Phase 3: Insights, Polish & PWA (7-10 days)

**Goal:** Make the app feel intelligent and production-ready.

**Deliverables:**
- Correlation engine (simple statistical rules + basic comparisons: sleep vs energy, protein vs performance, etc.).
- Weekly and monthly report pages.
- PWA setup (manifest, service worker, offline logging where possible).
- Full design system polish: micro-interactions, empty states, error states, loading states.
- Accessibility audit (keyboard nav, contrast, ARIA).
- Settings page (profile, preferences, data export).

**Success Criteria:**
- App feels premium and addictive.
- User can find meaningful insights within <60 seconds.
- Installable on phone with good offline experience for logging.

**Warnings:**
- This phase makes or breaks the "wow" factor. Half-polished = mediocre portfolio project.

---

## Phase 4: Advanced Features & Demo Readiness (5-8 days)

**Deliverables:**
- Goal setting with progress projections and variance tracking.
- Workout / habit templates and routines.
- Data export (JSON + CSV).
- Demo mode / public preview with rich seeded data.
- Admin / settings for data management (delete old logs, etc.).
- Final SEO + meta tags for portfolio showcase.
- Comprehensive README.md with screenshots and demo link.

**Success Criteria:**
- Someone can open the live demo and understand the value in under 3 minutes.
- You personally want to use this daily.

**Warnings:**
- Don’t add features here that break earlier phases. Stability > shiny new toys.

---

## Phase 5: Battle Testing & Launch (Ongoing — minimum 14 days)

**Goal:** Ship something you’re proud of and actually use.

**Deliverables:**
- Use the app daily for minimum 2 weeks.
- Ruthlessly fix every friction point you encounter.
- Add unit/integration tests for critical paths (auth, logging, calculations).
- Performance audit and optimizations.
- Final deployment (Vercel) with custom domain.
- High-quality screenshots and 60-second loom video for portfolio.
- Update all documentation files.

**Success Criteria:**
- Zero major bugs.
- You continue using it after the "portfolio project" phase ends.
- A senior developer would say “I’d actually consider using this.”

**Warnings:**
- Most people stop at Phase 4. The difference between average and exceptional portfolio pieces happens in Phase 5. Don’t skip it.

---

## Overall Project Timeline Estimate
**Realistic total:** 5–8 weeks (part-time) if you stay disciplined.

Do **not** extend phases because you’re adding new features. Cut scope instead.

---

**Maintenance Note:** Revisit this file at the start of every phase. Update actual completion dates and lessons learned in NOTES.md.
