# TRD.md

**Project:** Momentum  
**Document Type:** Technical Requirements Document

This document defines the technical architecture, stack, standards, and non-negotiable decisions for the project. It serves as the blueprint for all implementation work.

---

## 1. Core Technical Philosophy

- **Production Mindset:** Code as if this will support real users and scale. No prototype shortcuts.
- **Usefulness First:** The app must be genuinely useful to the developer daily. Friction = immediate fix.
- **Depth Over Breadth:** One exceptionally executed module beats five mediocre ones.
- **Type Safety & Reliability:** Strict TypeScript everywhere. No `any`. Runtime errors are unacceptable in a portfolio piece.
- **Performance Obsession:** Dashboard and logging flows must feel instant.

---

## 2. Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (client state) + TanStack Query (server state, caching, mutations)

**Authentication:**
- **Clerk** (primary auth provider)
  - Custom Session Tokens (CST) for injecting user roles, preferences, and metadata into the session.
  - Rationale: Better reliability for roles/metadata sync compared to webhooks alone. Avoids ngrok issues and inconsistent state experienced in previous projects.
  - Use Clerk's JWT templates to add necessary claims (e.g., roles, profile flags) directly into the session token.

**Backend / Database:**
- Supabase (PostgreSQL + Storage + Realtime)
- Clerk + Supabase integration via Clerk session tokens passed to Supabase client for RLS.
- Row Level Security (RLS) enforced on all tables using `auth.uid()` or Clerk user ID.

**Forms & Validation:**
- React Hook Form + Zod

**Charts & Visualization:**
- Tremor + Recharts

**Date & Time:**
- date-fns + Luxon (timezone safety is mandatory)

**PWA & Offline:**
- Next-PWA or manual service worker setup

**Deployment:**
- Vercel

**Testing:**
- Vitest + React Testing Library (critical paths only — auth, logging, calculations)

---

## 3. Key Architectural Decisions

1. **Auth Strategy (Clerk + CST)**  
   - Clerk handles sign-up, login, sessions.  
   - Custom Session Tokens to embed roles, preferences, and lightweight metadata.  
   - Supabase RLS policies based on Clerk user ID passed via token.  
   - This solves past issues with webhook reliability and role syncing.

2. **Data Layer**  
   - Direct Supabase client with Clerk token injection.  
   - No custom backend API layer for v1 (Supabase Edge Functions only if needed later).  
   - Heavy use of `jsonb` for flexible structures (recurrence, workout sets).

3. **State Management**  
   - TanStack Query for all server data (caching, optimistic updates, invalidation).  
   - Zustand for UI/local state only.

4. **UI Architecture**  
   - Follow **UIUX_BRIEF.md** strictly (Glassmorphism + Soft UI).  
   - shadcn/ui as base component library.  
   - All components must include loading, error, and empty states.

5. **Performance & UX**  
   - Optimistic updates on all logging actions.  
   - Proper pagination/indexing for history views.  
   - Mobile-first with excellent desktop support.  
   - PWA installable with offline logging queue.

6. **Correlation Engine**  
   - Start with SQL views + frontend calculations.  
   - Keep simple and fast for v1.

**Rejected Alternatives:**
- Pure Supabase Auth (Clerk provides superior UI/UX components and session management).
- Firebase (weaker complex querying).
- tRPC (overkill with Supabase + Clerk).
- Full custom backend (slower velocity for portfolio project).

---

## 4. Coding Standards & Quality Rules

- **TypeScript:** Strict mode. No `any`. Exhaustive type checking.
- **Linting:** ESLint + Prettier enforced. No disabled rules without justification.
- **Components:** Every public component needs proper states (loading/error/empty/success).
- **Dates:** Always handle in user timezone. Store as `date` or `timestamptz` appropriately.
- **Error Handling:** Global error boundary + user-friendly messages. Never silent failures.
- **Validation:** Client (Zod) + Server (Supabase/Zod).
- **Security:** RLS everywhere. Input sanitization. No sensitive data in client.
- **Git:** Conventional commits. Feature branches. No direct main pushes.

---

## 5. Non-Functional Requirements

- **Performance:** Main views < 1.5s load (even with 1+ year data).
- **Accessibility:** WCAG 2.2 AA minimum (see UIUX_BRIEF.md).
- **Maintainability:** Clean folder structure, consistent naming, good comments on complex logic.
- **Observability:** Console clarity + proper error logging during development.

---

## 6. Documentation References

All implementation must respect:
- **PRD.md** — Product vision and features
- **APP_FLOW.md** — Routing and user journeys
- **UIUX_BRIEF.md** — Design system
- **SCHEMA.md** — Data models
- **PHASES.md** — Execution plan
- **NOTES.md** — Daily notes, learnings, and todos

---

**This TRD is law.** Any deviation must be documented here with justification and updated across related files.

**Maintenance Rule:** Review this document at the start of every phase. Update decisions as new learnings emerge.
