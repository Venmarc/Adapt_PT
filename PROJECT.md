**PROJECT.md**

**Project Name:** Adaptive Life OS (or "Forge" / "Vitalis" — pick a strong brand name)

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
- Correlation engine: “Low energy days correlate with <X protein” or “Missed workouts after <6h sleep”.
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

### 6. Phases / Milestones (Build in this order)

**Phase 0: Foundation (1-2 days)**
- Project setup, auth, DB schema, basic layout + navigation.

**Phase 1: Core Logging (1 week)**
- Habits + basic logging.
- Fitness basic logger.
- Wellness quick logger.
- Dashboard v1.

**Phase 2: Data & Progress (1-1.5 weeks)**
- History views.
- Charts & visualizations.
- Body measurements.

**Phase 3: Insights & Polish (1-1.5 weeks)**
- Correlation logic.
- Reports.
- PWA + offline.
- Design system refinement.

**Phase 4: Advanced + Stretch**
- Templates, goal system with projections.
- Export, settings, data management.
- Demo seeding + public demo mode.

**Phase 5: Battle Testing**
- Use it yourself for 2+ weeks.
- Fix friction ruthlessly.
- Add tests where high value.
- Deploy + domain.

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
