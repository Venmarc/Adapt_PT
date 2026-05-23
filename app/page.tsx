import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import { ensureProfile } from '@/app/actions/auth-actions';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  CheckSquare, Dumbbell, Heart, Activity, TrendingUp, Calendar, 
  Clock, ArrowRight, UserPlus, LogIn, ChevronRight, CheckCircle2, Circle
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard | Momentum',
  description: 'Your personal operating system for habits, fitness, and wellness.',
};

export default async function DashboardPage() {
  const { userId } = await auth();

  // --- SIGNED OUT LANDING PAGE ---
  if (!userId) {
    return (
      <div className="flex-1 flex flex-col bg-black text-[#f4f4f5] relative overflow-hidden">
        
        {/* Decorative Grid and Ambient Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-success/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-4xl mx-auto space-y-8 z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-success/10 text-brand-success border border-brand-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping" />
              Phase 1 Live
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              A Personal Operating System <br />
              <span className="bg-gradient-to-r from-brand-success to-emerald-400 bg-clip-text text-transparent">
                For Your Life Goals
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
              Track habits, log workouts, and monitor sleep and mood in one cohesive, beautiful workspace. Built for developers and high-achievers who want deep metrics, not just generic streaks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <SignInButton mode="modal">
              <button className="w-48 py-3.5 px-6 bg-brand-success hover:bg-brand-success-hover text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-brand-success/15 hover:shadow-brand-success/20">
                <LogIn className="w-4.5 h-4.5 stroke-[2.5]" />
                Sign In to Platform
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-48 py-3.5 px-6 bg-transparent hover:bg-[#18181b] border border-[#27272a] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-[#3f3f46]">
                <UserPlus className="w-4.5 h-4.5" />
                Register Account
              </button>
            </SignUpButton>
          </div>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
            <div className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-6 text-left space-y-3.5 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Flexible Habits Engine</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Log recurring goals (daily, weekly, specific weekdays) with difficulty ratings, context tags, and detailed logs.
              </p>
            </div>

            <div className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-6 text-left space-y-3.5 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Interactive Workout Logger</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Build custom routines or run preset templates. Tracks volume metrics, estimates 1RM, and launches an automatic visual rest timer capsule.
              </p>
            </div>

            <div className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-6 text-left space-y-3.5 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Wellness & Sleep Tracker</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Monitor sleep hours, sleep quality, daily mood index, and energy levels to uncover correlations with your physical output.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --- SIGNED IN DASHBOARD PAGE ---
  await ensureProfile();
  const supabase = createSupabaseServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const displayName = profile?.full_name || profile?.username || 'Victor';

  // 2. Fetch habits stats
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  const activeHabitsCount = habits?.length || 0;

  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_date', todayStr);

  const completedTodayCount = todayLogs?.filter(l => l.completed).length || 0;
  const habitCompletionPercent = activeHabitsCount > 0 
    ? Math.round((completedTodayCount / activeHabitsCount) * 100) 
    : 0;

  // 3. Fetch workouts stats
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  const totalWorkoutsLogged = workouts?.length || 0;
  const latestWorkout = workouts?.[0] || null;

  // 4. Fetch wellness entry for today
  const { data: todayWellness } = await supabase
    .from('wellness_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', todayStr)
    .single();

  // Format today's human-readable date
  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-8 bg-black text-[#f4f4f5] pb-20">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-16 md:mt-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-xs text-[#a1a1aa] font-medium">{displayDate}</p>
        </div>
        
        {/* Life Score / Metric Quick Info */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-success/15 flex items-center justify-center text-brand-success font-extrabold text-sm">
            {habitCompletionPercent}%
          </div>
          <div>
            <p className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-wider">Today's Progress</p>
            <p className="text-xs font-semibold text-white">
              {completedTodayCount} of {activeHabitsCount} habits logged
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Habits and Fitness summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Habits Checklist Widget */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-blue-400" />
                Habits Due Today
              </h2>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded-md font-semibold">
                {activeHabitsCount} active
              </span>
            </div>

            {activeHabitsCount === 0 ? (
              <p className="text-xs text-[#a1a1aa] py-4 italic">No habits registered. Create one to begin logging!</p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {habits?.map((h) => {
                  const log = todayLogs?.find(l => l.habit_id === h.id);
                  const isDone = !!log?.completed;
                  return (
                    <div key={h.id} className="flex items-center justify-between p-2 bg-[#121214] border border-[#1e1e22] rounded-lg">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'}`}>
                        {h.name}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-brand-success" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-[#27272a]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/habits"
            className="w-full mt-2 py-2 border border-[#27272a] hover:border-zinc-700 bg-[#121214] hover:bg-[#18181b] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white transition-colors"
          >
            Manage Habits
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Fitness / Workout Logger Widget */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4.5 h-4.5 text-brand-success" />
                Fitness Status
              </h2>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded-md font-semibold">
                {totalWorkoutsLogged} workouts
              </span>
            </div>

            {latestWorkout ? (
              <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-4 space-y-3.5">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#a1a1aa] font-bold">Last Training Session</p>
                  <p className="text-sm font-bold text-white mt-0.5">{latestWorkout.name}</p>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    {new Date(latestWorkout.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {latestWorkout.total_duration_minutes ? ` • ${latestWorkout.total_duration_minutes} min` : ''}
                  </p>
                </div>
                {latestWorkout.total_volume_kg && latestWorkout.total_volume_kg > 0 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-white border-t border-[#1e1e22] pt-2.5">
                    <Activity className="w-3.5 h-3.5 text-brand-success" />
                    <span>Total Volume: </span>
                    <span className="text-brand-success">{latestWorkout.total_volume_kg.toLocaleString()} kg</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-[#27272a] rounded-xl p-4">
                <p className="text-xs text-[#a1a1aa]">No sessions logged yet.</p>
                <p className="text-[10px] text-[#71717a] mt-0.5">Preset routines are ready to load inside the logger.</p>
              </div>
            )}
          </div>

          <Link
            href="/fitness"
            className="w-full mt-2 py-2 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white transition-colors"
          >
            Start Workout
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Wellness snapshot widget row */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-pink-400" />
            Wellness Log
          </h2>
          <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {todayWellness ? 'Logged' : 'Pending'}
          </span>
        </div>

        {todayWellness ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[9px] text-[#71717a] font-bold uppercase">Mood Index</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{todayWellness.mood} / 5</span>
            </div>
            <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[9px] text-[#71717a] font-bold uppercase">Energy Level</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{todayWellness.energy} / 5</span>
            </div>
            <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[9px] text-[#71717a] font-bold uppercase">Sleep Hours</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{todayWellness.sleep_hours} hrs</span>
            </div>
            <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[9px] text-[#71717a] font-bold uppercase">Sleep Quality</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{todayWellness.sleep_quality} / 5</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
            <div>
              <p className="text-xs font-semibold text-white">How are you feeling today?</p>
              <p className="text-[10px] text-[#a1a1aa] mt-0.5">Quickly track your daily sleep duration, energy level, and mood scores.</p>
            </div>
            <Link
              href="/wellness"
              className="py-2 px-4 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-pink-500/25 text-pink-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              Log Wellness
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
