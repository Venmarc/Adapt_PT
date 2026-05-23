import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import HabitsClient from '@/app/components/habits/habits-client';
import { ensureProfile } from '@/app/actions/auth-actions';

export const metadata = {
  title: 'Habits | Momentum',
  description: 'Manage and log your daily habits, view streaks, and track adherence.',
};

export default async function HabitsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  // Ensure user has profile synced in database (especially for local dev)
  await ensureProfile();

  const supabase = createSupabaseServiceClient();

  // Fetch all habits belonging to the user
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (habitsError) {
    console.error('Error fetching habits:', habitsError);
  }

  // Fetch habit logs for the last 30 days
  const startOffsetDate = new Date();
  startOffsetDate.setDate(startOffsetDate.getDate() - 30);
  const startOffsetStr = startOffsetDate.toISOString().split('T')[0];

  const { data: logs, error: logsError } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', startOffsetStr);

  if (logsError) {
    console.error('Error fetching habit logs:', logsError);
  }

  return (
    <HabitsClient
      initialHabits={habits || []}
      initialLogs={logs || []}
    />
  );
}
