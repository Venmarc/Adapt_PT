### **SCHEMA.md**

**Database Schema - Adaptive Life OS**

**Database:** PostgreSQL (Supabase recommended)

#### **Core Tables**

```sql
-- Users
create table public.profiles (
  id uuid primary key references auth.users not null,
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
  user_id uuid references public.profiles not null,
  name text not null,
  description text,
  category text, -- e.g., "Health", "Fitness", "Mindfulness"
  recurrence jsonb not null, -- { type: "daily" | "weekly" | "interval", days: [...], times_per_week: int, every_x_days: int }
  target_count int default 1, -- e.g., drink 8 glasses
  unit text, -- "glasses", "minutes", etc.
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);


-- Habit Logs
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits not null,
  user_id uuid references public.profiles not null,
  logged_date date not null,
  completed boolean not null,
  count numeric, -- for quantifiable habits
  notes text,
  difficulty int check (difficulty between 1 and 5), -- 1-5
  context_tags text[], -- e.g., ["work", "travel"]
  created_at timestamp with time zone default now()
);

-- Exercises Library
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text, -- "Push", "Pull", "Legs", "Cardio", etc.
  muscle_group text[],
  is_custom boolean default false,
  user_id uuid references public.profiles, -- null = global
  created_at timestamp with time zone default now()
);

-- Workouts
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  name text not null,
  date date not null,
  notes text,
  total_duration_minutes int,
  total_volume_kg numeric,
  created_at timestamp with time zone default now()
);

-- Workout Exercises (sets)
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts not null,
  exercise_id uuid references public.exercises not null,
  order_index int,
  sets jsonb[] -- array of {reps: int, weight_kg: numeric, rpe: numeric, notes: text}
);

-- Wellness Entries (Daily)
create table public.wellness_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  entry_date date not null unique,
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  sleep_hours numeric(3,1),
  sleep_quality int check (sleep_quality between 1 and 5),
  notes text,
  created_at timestamp with time zone default now()
);

-- Body Measurements
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
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
  user_id uuid references public.profiles not null,
  title text not null,
  description text,
  target_date date,
  target_value numeric,
  current_value numeric default 0,
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Settings / Preferences
create table public.user_preferences (
  user_id uuid primary key references public.profiles,
  theme text default 'dark',
  week_starts_on text default 'monday',
  notifications_enabled boolean default true,
  timezone text default 'UTC'
);
```

**Indexes** (add these):
- habit_logs (user_id, logged_date)
- habit_logs (habit_id, logged_date)
- workouts (user_id, date)
- wellness_entries (user_id, entry_date)

**Row Level Security:** Enable RLS on all tables. Policies must restrict to `auth.uid() = user_id`.

**Key Notes:**
- Use `jsonb` heavily for flexible recurrence and sets.
- All user-facing dates should be handled in user timezone on the frontend.
- Audit/log tables optional for v2.
