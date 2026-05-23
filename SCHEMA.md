# SCHEMA.md

**Project:** Momentum  
**Database:** Supabase PostgreSQL  
**Auth Provider:** Clerk (Primary) + Supabase RLS integration

**Core Principle:** Clerk user ID (string) is the source of truth for all user references.

---

## Core Tables

```sql
-- Profiles (Main user table)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,                    -- Clerk's user_2xxxxx ID
  full_name text,
  username text unique,
  avatar_url text,
  date_of_birth date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  name text not null,
  description text,
  category text,
  recurrence jsonb not null,
  target_count int default 1,
  unit text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habit Logs
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits on delete cascade not null,
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  logged_date date not null,
  completed boolean not null,
  count numeric,
  notes text,
  difficulty int check (difficulty between 1 and 5),
  context_tags text[],
  created_at timestamp with time zone default now()
);

-- Exercises Library
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  muscle_group text[],
  is_custom boolean default false,
  clerk_id text references public.profiles(clerk_id) on delete cascade, -- null = global
  created_at timestamp with time zone default now()
);

-- Workouts
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  name text not null,
  date date not null,
  notes text,
  total_duration_minutes int,
  total_volume_kg numeric,
  created_at timestamp with time zone default now()
);

-- Workout Exercises
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_id uuid references public.exercises not null,
  order_index int not null,
  sets jsonb not null default '[]'::jsonb,   -- Better as jsonb column than jsonb[]
  created_at timestamp with time zone default now()
);

-- Wellness Entries
create table public.wellness_entries (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  entry_date date not null,
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  sleep_hours numeric(3,1),
  sleep_quality int check (sleep_quality between 1 and 5),
  notes text,
  created_at timestamp with time zone default now(),
  unique(clerk_id, entry_date)
);

-- Body Measurements
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  measured_date date not null,
  weight_kg numeric(5,2),
  body_fat_pct numeric(4,2),
  muscle_mass_kg numeric(5,2),
  waist_cm numeric(5,2),
  chest_cm numeric(5,2),
  notes text,
  photo_urls text[],
  created_at timestamp with time zone default now()
);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.profiles(clerk_id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  target_value numeric,
  current_value numeric default 0,
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- User Preferences
create table public.user_preferences (
  clerk_id text primary key references public.profiles(clerk_id) on delete cascade,
  theme text default 'dark',
  week_starts_on text default 'monday',
  notifications_enabled boolean default true,
  timezone text default 'UTC',
  updated_at timestamp with time zone default now()
);
```

---

### Important Indexes (Add These)

```sql
create index idx_habit_logs_clerk_date on public.habit_logs(clerk_id, logged_date);
create index idx_habit_logs_habit_date on public.habit_logs(habit_id, logged_date);
create index idx_workouts_clerk_date on public.workouts(clerk_id, date);
create index idx_wellness_clerk_date on public.wellness_entries(clerk_id, entry_date);
create index idx_body_measurements_clerk_date on public.body_measurements(clerk_id, measured_date);
```

---

### Row Level Security (RLS) Strategy

Enable RLS on **all** tables.

**Policy Example (apply similar pattern to all tables):**

```sql
-- Example for habits
create policy "Users can only access their own habits"
  on public.habits
  using (clerk_id = (auth.jwt()->>'clerk_id')::text);   -- Using custom session token
```

**Important:** Since we're using Clerk Custom Session Tokens (CST), you must include `clerk_id` in the JWT claims so Supabase RLS can read it via `auth.jwt()`.

---

### Key Notes & Recommendations

1. **Clerk Integration**:
   - On user signup/login (via webhook or client), create/sync the `profiles` row with `clerk_id`.
   - Store `clerk_id` everywhere instead of `user_id`.

2. **Foreign Keys**: All use `clerk_id text` + `on delete cascade` for safety.

3. **JSONB Usage**:
   - `recurrence` and `sets` are fine as jsonb. Good flexibility.

4. **Timezone Handling**: Store dates as `date` where possible. Let frontend + Luxon handle display.

5. **Future-Proof**: You can later add `supabase_user_id uuid` if needed, but for now this is cleaner.
