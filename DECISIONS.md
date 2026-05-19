### **DECISIONS.md**

**Architectural & Technology Decisions - Adaptive Life OS**

**Core Stack**
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **State Management:** Zustand + TanStack Query (React Query)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Charts:** Tremor + Recharts (or lightweight Chart.js if needed)
- **Forms:** React Hook Form + Zod
- **Date Handling:** date-fns + Luxon (for timezone safety)
- **PWA:** Next-PWA or manual service worker
- **Deployment:** Vercel

**Why This Stack?**
- Next.js gives SSR, great SEO for portfolio, file-system routing, and API routes if needed.
- Supabase = fastest way to production-grade backend (auth, realtime, storage, postgres). Beats Firebase on complex queries.
- TypeScript everywhere. No excuses for runtime errors in a portfolio piece.
- Tailwind + shadcn = fast, consistent, beautiful UI without design debt.

**Key Decisions**
1. **Single Project, Deep Execution** — One very strong app > multiple shallow ones.
2. **Data First** — Solid normalized schema with flexible jsonb where needed. Bad data model kills the project.
3. **Optimistic Updates** — All logging actions must feel instant.
4. **Mobile-First + Desktop Excellent** — PWA installable. Most daily use will be mobile.
5. **No Backend Server** (for now) — Supabase Edge Functions only if absolutely needed.
6. **Correlation Engine** — Start with simple SQL views + frontend calculations. Move to materialized views or basic ML later.
7. **Design** — Dark mode default. Premium fitness SaaS aesthetic (think Whoop + Notion + Hevy combined).
8. **Auth** — Supabase Auth with email + magic links + social. Strong session management.
9. **Testing** — Vitest + React Testing Library for critical paths only (don’t overdo early).

**Decisions I Might Regret (but still making):**
- Using jsonb for workout sets (flexibility wins over strict normalization for v1).
- No full backend API layer yet (Supabase client direct is acceptable for this scale).

**Rejected Options:**
- Firebase (worse querying)
- Plain React + separate backend (slower development)
- tRPC (overkill with Supabase)
- Full native mobile (unnecessary for portfolio v1)
