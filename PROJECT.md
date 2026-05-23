**PROJECT.md**

**Project Name:** Momentum

**Tagline:** Your personal operating system for habits, fitness, and wellness that actually adapts to your life and shows you why you’re winning or failing.

### 1. Vision & Objectives
Build a **production-grade**, beautiful, and genuinely useful habit + fitness + wellness tracker that you will actually use daily for the next 12+ months.

**Primary Goals:**
- Portfolio piece that stands out: complex state management, rich data visualization, insightful analytics, multi-module integration, PWA feel.
- Personal ROI: measurable improvements in your own habits/fitness/wellness.
- Demonstrate: TypeScript mastery, modern full-stack patterns, real-time elements, data modeling depth, polished UX.

**Non-goals (avoid scope creep):** Social network features (at first), AI chatbot, hardware device sync, full mobile apps (PWA first).

### 2. Target User (You + Portfolio persona)
- Tech-savvy professionals / developers / fitness enthusiasts aged 25-40.
- Wants deep insights, not just streaks.
- Values clean, motivating, non-toxic design (dark mode default).
- Tracks multiple life areas in one place.

### 3. Core Modules (MVP Scope — ruthlessly prioritize)

**Habits Module**
- Create/edit habits with flexible recurrence (daily, specific weekdays, X times per week, interval, etc.).
- Streak tracking, chaining, reset rules.
- Quick log (with notes, difficulty rating, context tags).
- Categories + grouping.

**Fitness Module**
- Workout logger: exercises (library + custom), sets/reps/weight/time, RPE, rest timer.
- Progress tracking: 1RM estimates, volume over time, PRs.
- Body measurements + photos timeline.
- Pre-built or template workouts.

**Wellness Module**
- Daily mood/energy/sleep tracker (quick 3-tap entry).
- Journal / notes with prompts.
- Symptom / habit correlation tracker.

**Unified Dashboard**
- Today’s overview (habits due, workout planned, wellness snapshot).
- Key metrics at a glance: weekly completion %, streak heatmaps, net worth-style “Life Score”.

**Analytics & Insights (this is what makes it non-trash)**
- Correlation engine: “Low energy days correlate with <"X" protein” or “Missed workouts after <6hrs sleep”.
- Trend charts (habits adherence, strength progression, mood averages).
- Weekly/Monthly reports.
- Goal projections and variance.

**Additional Must-Haves**
- Full authentication + user profiles.
- Data export (JSON/CSV).
- Dark/Light mode (system preference).
- Responsive + PWA (installable, offline capable where sensible).
- Responsive data seeding for demo mode.

### 4. User Flows (Critical)
1. Onboarding → Quick profile + initial habits/goals import.
2. Daily entry flow (under 30 seconds for core logging).
3. Deep logging / workout builder.
4. Review & Insights deep dive.
5. Goal setting & adjustment.

Every flow must feel fast and addictive. If logging takes more than 15-20 seconds, it’s trash.

### 5. Non-Functional Requirements
- **Performance:** < 1.5s load for main views even with 1+ year of data. Use proper indexing + pagination.
- **UX Quality:** Micro-interactions, skeleton loaders, optimistic updates, keyboard shortcuts, accessibility (ARIA, contrast).
- **Data Integrity:** Proper constraints, audit logs for changes if possible, robust conflict resolution for offline.
- **Security:** Secure auth, input sanitization, rate limiting hints, no sensitive data leaks.
- **Maintainability:** Clean architecture, good types, component library or consistent design tokens.
- **Polish:** Error states, empty states, success toasts, confirmation dialogs — all thoughtful.

### 6. Development Phases

See **PHASES.md** for detailed deliverables, timelines, success criteria, and warnings per phase.

**High-level overview:**
- Phase 0: Foundation (1-3 days)
- Phase 1: Core Logging (5-8 days)
- Phase 2: Progress & Visualization (7-10 days)
- Phase 3: Insights, Polish & PWA (7-10 days)
- Phase 4: Advanced Features & Demo Readiness (5-8 days)
- Phase 5: Battle Testing & Launch (minimum 14 days of real usage)

### 7. Design & Feel Guidelines
- Premium fitness app aesthetic: sharp, motivational but not bro-science.
- Heavy use of cards, progress rings, heatmaps (like GitHub).
- Consistent spacing, typography scale, color semantics (green = win, amber = warning).
- Mobile-first, but excellent desktop experience (sidebars on large screens).

### 8. Things You’ll Want to Ignore (But Shouldn’t)
- Proper error boundaries and user-friendly error messages.
- Loading states everywhere.
- Optimistic updates + rollback on failure.
- Data validation on both client and server.
- Responsive testing on actual devices (not just browser resize).
- Accessibility basics.
- README with screenshots, architecture diagram, setup, and "why I built it this way".
- Seeded realistic data for portfolio viewers.
- Performance profiling before declaring "fast enough".
- Backup/restore or data migration strategy (even simple).

If you half-ass any of these, the project instantly drops from "strong" to "another todo app".

### 9. Success Criteria
- Use it daily without friction.
- Senior dev looks at it and says “Damn, this feels like a real product”.
- Live demo is smooth and impressive in under 3 minutes.
- Contains at least 3 non-trivial data visualizations with real value.
- Clean, type-safe, well-structured codebase.

## Project Files & Reference Rules

This PROJECT.md is the single source of truth. All other files exist to support it.

- **SCHEMA.md** — Database schema + RLS
- **DECISIONS.md** — Tech stack & versions, architecture, and all major decisions/rationale (updated regularly)
- **CONSTITUTION.md** — Non-negotiable rules and quality standards
- **NOTES.md** — Personal scratchpad, current phase status, future ideas, lessons
- **SCHEMA.md, DECISIONS.md, CONSTITUTION.md** must be referenced by the AI/agent in every major planning or implementation response.

**Process Rule (Enforced):**
Before starting any new Phase or major feature:
1. Update PROJECT.md with clear goals
2. Reference relevant files (DECISIONS, CONSTITUTION, SCHEMA)
3. Plan happy path + error cases
4. Implement → Manual test → Review code yourself → Commit

New chat per Phase or complex feature. Do not let context bloat.
