# PRD.md

**Project:** Momentum  
**Document Type:** Product Requirements Document

**Tagline:** Your personal operating system for habits, fitness, and wellness that actually adapts to your life and shows you why you’re winning or failing.

---

## 1. Vision & Objectives

Build a **production-grade**, beautiful, and genuinely useful habit + fitness + wellness tracker that you will actually use daily for the next 12+ months.

**Primary Goals:**
- Stand-out portfolio piece demonstrating complex state management, rich data visualization, insightful analytics, multi-module integration, and premium UX.
- Deliver real personal ROI: measurable improvements in habits, fitness, and wellness.
- Feel like a real SaaS product — polished, fast, addictive, and intelligent.

**Non-Goals (Strict Scope Control):**
- Social features or community
- Full AI chatbot
- Hardware integrations (Apple Health, etc. — mock only)
- Native mobile apps (PWA only for now)

---

## 2. Target Audience

- Tech-savvy professionals, developers, and fitness enthusiasts aged 25-40.
- People who want deep insights and correlations, not just basic streaks and checkboxes.
- Value clean, motivating, non-toxic design with dark mode as default.

---

## 3. Core Features & Modules

### Habits Module
- Flexible recurrence (daily, specific weekdays, X times per week, custom intervals).
- Streak tracking, chaining, and smart reset rules.
- Quick + detailed logging (notes, difficulty 1-5, context tags, count for quantifiable habits).
- Categories and grouping.

### Fitness Module
- Workout logger with searchable exercise library (global + custom).
- Sets/reps/weight/time/RPE support, rest timer.
- Progress tracking: 1RM estimates, volume, PR detection, body measurements + photo timeline.
- Template workouts.

### Wellness Module
- Quick daily entry: mood, energy, sleep hours/quality (3-tap minimum).
- Journal notes with prompts.
- Data for correlation engine.

### Today Dashboard (Core Daily Hub)
- Unified view: due habits, wellness snapshot, workout quick log, Life Score.
- Prioritized actions for sub-20-second daily logging.

### Insights & Analytics
- Correlation engine (e.g., “Low energy correlates with poor sleep” or “Missed workouts after <6h sleep”).
- Trend charts and heatmaps.
- Weekly/Monthly reports.
- Goal projections and variance tracking.

### Goals Module
- Create goals with target values, dates, and progress projections.

**Must-Have Cross-Cutting Features:**
- Full authentication and user profiles.
- Data export (JSON + CSV).
- PWA with offline logging capability.
- Responsive design (mobile-first).
- Demo mode with rich seeded data.

---

## 4. User Flows & Journeys

See **APP_FLOW.md** for complete routing, navigation structure, page details, and interaction flows.

**Critical Journeys:**
1. **Onboarding:** Register → Profile setup → Suggested starter habits/goals → Land on `/today`.
2. **Daily Logging:** Open app → `/today` → Log habits/wellness/workout in <20 seconds.
3. **Deep Review:** Sidebar → Insights or Progress → Drill into charts and correlations.
4. **Editing:** History views allow editing past entries with full propagation to analytics.

Every flow must feel fast and rewarding. Slow or clunky logging = project failure.

---

## 5. Non-Functional Requirements

- **Performance:** Main views load under 1.5s even with 1+ year of data.
- **UX Quality:** Micro-interactions, optimistic updates, skeleton loaders, excellent accessibility.
- **Data Integrity:** Strong validation (client + server), proper constraints, timezone-aware dates.
- **Security:** Secure auth, RLS on all tables, input sanitization.
- **Polish:** Thoughtful empty states, error handling, success feedback, and confirmation dialogs.
- **Design System:** See **UIUX_BRIEF.md** — Glassmorphism + Soft UI, dark-first, accessible.

---

## 6. Design & Experience Guidelines

See **UIUX_BRIEF.md** for full visual language, color palette, typography, components, motion, and accessibility rules.

High-level direction: Premium glassmorphism with soft UI elements, motivational but calm aesthetic, heavy use of progress visuals and clean data presentation.

---

## 7. Development Phases

See **PHASES.md** for detailed deliverables, timelines, success criteria, and warnings per phase.

**High-level Overview:**
- Phase 0: Foundation (1-3 days)
- Phase 1: Core Logging (5-8 days)
- Phase 2: Progress & Visualization (7-10 days)
- Phase 3: Insights, Polish & PWA (7-10 days)
- Phase 4: Advanced Features & Demo Readiness (5-8 days)
- Phase 5: Battle Testing & Launch (minimum 14 days real usage)

**Total Realistic Timeline:** 5–8 weeks part-time. Cut scope ruthlessly instead of extending timelines.

---

## 8. Success Criteria

- You use Momentum daily without friction for weeks after "completion".
- A senior developer reviews it and says “This feels like a real product I would use.”
- Live demo impresses in under 3 minutes.
- Contains at least 3 meaningful, non-trivial data visualizations.
- Codebase is clean, type-safe, and maintainable.

---

## 9. Documentation Structure

- **PRD.md** (this file) — Product vision, features, and requirements.
- **TRD.md** — Technical decisions, architecture, stack, and standards.
- **APP_FLOW.md** — Routing, navigation, and user journeys.
- **UIUX_BRIEF.md** — Visual design system and interaction rules.
- **SCHEMA.md** — Database schema and data models.
- **PHASES.md** — Execution plan and phase details.
- **NOTES.md** — Daily notes, learnings, and todos.
- **README.md** — Public portfolio version.

**Rule:** Before starting any major phase or feature, review this PRD + relevant supporting documents. Keep all files in sync.

---

**This PRD is the product bible.** Any feature request or change must be evaluated against it. Scope creep will be rejected without strong justification.
