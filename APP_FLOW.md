# APP_FLOW.md

**Project:** Momentum  
**Document Type:** Application Flow & Navigation Specification

This document defines the complete user journey, page structure, navigation, and all major interactions. It serves as the single source of truth for routing, redirects, and flow logic. Any deviation must be updated here first.

---

## 1. Routing Overview

**Base URL:** `/` (app.momentum.com or localhost)

**Route Structure (App Router style):**

### Public Routes
- `/` → Landing / Marketing page (optional for portfolio)
- `/login`
- `/register`
- `/reset-password`
- `/invite/:code` (future)

### Protected Routes (require authentication)
- `/dashboard` → Main home
- `/today` → Daily hub (recommended default after login)
- `/habits`
- `/habits/new`
- `/habits/[id]`
- `/habits/[id]/edit`
- `/fitness`
- `/fitness/log`
- `/fitness/history`
- `/fitness/exercises`
- `/fitness/exercises/new`
- `/wellness`
- `/insights`
- `/progress`
- `/goals`
- `/profile`
- `/settings`
- `/data` (export/import)

**Catch-all:** `/*` → 404 page

---

## 2. Navigation Structure

**Desktop Sidebar (Left, collapsible on smaller screens):**
- Logo + "Momentum"
- Dashboard
- Today
- Habits
- Fitness
- Wellness
- Insights
- Progress
- Goals
- Divider
- Profile (bottom)
- Settings (bottom)

**Mobile Navigation:**
- Bottom tab bar: Today | Habits | Fitness | Wellness | Insights
- Hamburger menu for secondary items (Progress, Goals, Profile, Settings)

**Top Bar (on all protected pages):**
- Search (global)
- Notifications bell (future)
- User avatar → quick profile menu

---

## 3. Detailed Page Flows

### Auth Flows
- **Register** → After success → `/today` + onboarding modal (first habits + goals)
- **Login** → `/today`
- Failed auth → Stay on login with clear error + link to reset password
- Session expired → Redirect to `/login` with `?redirect=/today`

### Main User Flows

**1. Daily Flow (Most Important)**
- Default landing after login: `/today`
- Shows:
  - Today's date + greeting
  - Habit list for today (due + overdue)
  - Quick wellness logger (mood/energy/sleep)
  - Workout card (if scheduled or quick log button)
  - Life Score summary
- Logging actions:
  - Habit check → Optimistic update + confetti on streak milestones
  - "Log Workout" → Opens modal or goes to `/fitness/log?date=today`
  - Wellness → Inline form, saves instantly

**2. Habits Module**
- `/habits` → List of all habits with streaks, completion rate, filters (active/archived)
- Click habit → `/habits/[id]` (detail view + history)
- FAB button → `/habits/new`
- From detail: "Log entry" → Quick log form

**3. Fitness Module**
- `/fitness` → Overview (recent workouts, PRs, weekly volume)
- "Log Session" → `/fitness/log`
- Exercise library: `/fitness/exercises`
- History: `/fitness/history` with filters + charts

**4. Wellness Module**
- `/wellness` → Calendar view + mood/energy trends
- Quick entry always available from Today page

**5. Insights & Progress**
- `/insights` → Correlation insights, weekly report, key stats
- `/progress` → Charts hub (strength, habits adherence, body metrics, mood)

**6. Goals**
- `/goals` → Create/view goals with projections
- Goal detail shows progress bars and predicted completion date

---

## 4. Critical User Journeys

**New User Onboarding Journey:**
1. Register → 
2. Onboarding: Set name, preferences, quick start habits (suggestions) →
3. Land on `/today`

**Daily Logging Journey:**
1. Open app → `/today`
2. Log 3-4 habits
3. Log wellness (3 taps)
4. Optional: Log workout
5. See updated Life Score

**Deep Analysis Journey:**
1. From sidebar → `/insights`
2. Review correlations
3. Drill down into specific chart → filtered history
4. Export data option

**Editing Past Data:**
- From any history view → Click entry → Edit modal or dedicated edit page
- Changes should propagate to all affected insights/charts

---

## 5. Button & Action Mappings

- **"Log Habit"** (anywhere) → Opens quick log for that habit
- **"Start Workout"** → `/fitness/log?date=today`
- **"Add Habit"** → `/habits/new`
- **"View Insights"** from dashboard cards → `/insights`
- **Save any form** → Stay on page with success toast + optimistic update
- **Cancel** → Return to previous page or close modal
- **Delete** actions → Confirmation modal before executing

**Redirect Rules:**
- After successful create/edit → Back to list or detail view
- After delete → Back to list view
- After logging from Today → Stay on Today with refresh

---

## 6. Modals vs Pages

**Use Modals for:**
- Quick logging
- Exercise selection
- Confirmation dialogs
- Small forms (edit name, quick note)

**Use Full Pages for:**
- Complex forms (new habit, full workout log)
- Data-heavy views (history, insights)
- Settings

---

## 7. Error & Edge Case Flows

- No data → Strong empty states with clear CTA ("Create your first habit")
- Network error during log → Offline queue + toast ("Saved locally, syncing...")
- Permission errors → Friendly message + redirect to relevant page
- 404 → Clean page with "Back to Today" button

---

## 8. Future-Proofing Notes

- All routes should support date parameters where relevant (`?date=2026-05-23`)
- Deep linking support (share specific habit or insight)
- Keyboard shortcuts (documented in settings)

---

**Maintenance Rule:**  
Any time a new page, redirect, or major flow is added or changed, this document must be updated **immediately**. Outdated flow documentation creates bugs during development and testing.

This document is your navigation bible. Follow it strictly.
