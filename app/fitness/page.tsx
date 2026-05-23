import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import { ensureProfile } from '@/app/actions/auth-actions';
import FitnessClient from '@/app/components/fitness/fitness-client';

export const metadata = {
  title: 'Fitness | Momentum',
  description: 'Log and track your workouts, set reps and weights, and review training volumes.',
};

export default async function FitnessPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  // Ensure user has synced profile in database (especially for local dev)
  await ensureProfile();

  const supabase = createSupabaseServiceClient();

  // 1. Fetch all exercises (global + custom user exercises)
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('name', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching exercises library in FitnessPage:', exercisesError);
  }

  // 2. Fetch all user workouts
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        id,
        order_index,
        sets,
        exercise:exercises (
          id,
          name,
          category,
          muscle_group
        )
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (workoutsError) {
    console.error('Error fetching workouts history in FitnessPage:', workoutsError);
  }

  // Flatten and filter workouts to match client expected schema
  const formattedWorkouts = (workouts || []).map((w) => ({
    ...w,
    workout_exercises: (w.workout_exercises || [])
      .map((we: any) => ({
        id: we.id,
        order_index: we.order_index,
        sets: we.sets || [],
        exercise: we.exercise || null,
      }))
      .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index),
  }));

  return (
    <FitnessClient
      initialExercises={exercises || []}
      initialWorkouts={formattedWorkouts}
    />
  );
}
