'use server';

import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saveWorkoutSchema } from '@/app/lib/validation';

export type SaveWorkoutInput = z.infer<typeof saveWorkoutSchema>;

/**
 * Fetch all available exercises (global + custom user exercises)
 */
export async function getExercises() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in getExercises action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Creates a custom exercise for the user
 */
export async function createCustomExercise(name: string, category: string, muscleGroups: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    if (!name || !category) {
      return { error: 'Name and Category are required' };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name,
        category,
        muscle_group: muscleGroups,
        is_custom: true,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom exercise:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in createCustomExercise action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Saves (inserts or updates) a workout session and its exercise sets
 */
export async function saveWorkout(input: SaveWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const parsed = saveWorkoutSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues.map(e => e.message).join(', ') };
    }

    const { workoutId, name, date, duration, notes, exercises } = parsed.data;
    const supabase = createSupabaseServiceClient();

    // Calculate total volume: weight * reps for completed sets only
    let totalVolume = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed !== false) {
          totalVolume += (set.weight_kg || 0) * (set.reps || 0);
        }
      });
    });

    let activeWorkoutId = workoutId;

    if (activeWorkoutId) {
      // 1. Verify ownership of the workout
      const { data: existing, error: fetchErr } = await supabase
        .from('workouts')
        .select('id')
        .eq('id', activeWorkoutId)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !existing) {
        return { error: 'Workout not found or unauthorized' };
      }

      // 2. Update existing workout
      const { error: updateErr } = await supabase
        .from('workouts')
        .update({
          name,
          date,
          notes,
          total_duration_minutes: duration,
          total_volume_kg: totalVolume,
        })
        .eq('id', activeWorkoutId);

      if (updateErr) {
        console.error('Error updating workout:', updateErr);
        return { error: updateErr.message };
      }

      // 3. Clear old workout exercises
      const { error: deleteWeErr } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', activeWorkoutId);

      if (deleteWeErr) {
        console.error('Error clearing old workout exercises:', deleteWeErr);
        return { error: deleteWeErr.message };
      }
    } else {
      // 1. Insert new workout
      const { data: newWorkout, error: insertWorkoutErr } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name,
          date,
          notes,
          total_duration_minutes: duration,
          total_volume_kg: totalVolume,
        })
        .select()
        .single();

      if (insertWorkoutErr || !newWorkout) {
        console.error('Error inserting workout:', insertWorkoutErr);
        return { error: insertWorkoutErr?.message || 'Failed to create workout' };
      }

      activeWorkoutId = newWorkout.id;
    }

    // 2. Insert new workout exercises
    if (exercises.length > 0) {
      const weToInsert = exercises.map((ex, index) => ({
        workout_id: activeWorkoutId!,
        exercise_id: ex.exercise_id,
        order_index: index,
        sets: ex.sets,
      }));

      const { error: insertWeErr } = await supabase
        .from('workout_exercises')
        .insert(weToInsert);

      if (insertWeErr) {
        console.error('Error inserting workout exercises:', insertWeErr);
        return { error: insertWeErr.message };
      }
    }

    revalidatePath('/fitness');
    revalidatePath('/');
    return { success: true, workoutId: activeWorkoutId };
  } catch (err) {
    console.error('Unexpected error in saveWorkout action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a workout session
 */
export async function deleteWorkout(workoutId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return { error: 'Workout not found or unauthorized' };
    }

    // Delete workout exercises (sets)
    const { error: deleteWeErr } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', workoutId);

    if (deleteWeErr) {
      console.error('Error deleting workout exercises:', deleteWeErr);
      return { error: deleteWeErr.message };
    }

    // Delete the workout
    const { error: deleteWorkoutErr } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (deleteWorkoutErr) {
      console.error('Error deleting workout:', deleteWorkoutErr);
      return { error: deleteWorkoutErr.message };
    }

    revalidatePath('/fitness');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteWorkout action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Fetch all workouts logged by the current user
 */
export async function getWorkouts() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching workouts:', error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in getWorkouts action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Fetch the latest logged sets for a specific exercise to use as previous values
 */
export async function getLatestSetsForExercise(exerciseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();

    // 1. Fetch the 10 most recent workouts for this user
    const { data: workouts, error: wError } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (wError || !workouts || workouts.length === 0) {
      return { success: true, data: null };
    }

    const workoutIds = workouts.map(w => w.id);

    // 2. Fetch the latest workout_exercise for this exercise among those workouts
    const { data: we, error: weError } = await supabase
      .from('workout_exercises')
      .select(`
        sets,
        workout_id
      `)
      .eq('exercise_id', exerciseId)
      .in('workout_id', workoutIds);

    if (weError || !we || we.length === 0) {
      return { success: true, data: null };
    }

    // Since workouts is sorted desc, find the one with the index closest to 0
    const matchedWe = we.reduce((prev, curr) => {
      const currIdx = workoutIds.indexOf(curr.workout_id);
      const prevIdx = workoutIds.indexOf(prev.workout_id);
      return currIdx < prevIdx ? curr : prev;
    });

    return { success: true, data: matchedWe.sets };
  } catch (err) {
    console.error('Unexpected error in getLatestSetsForExercise action:', err);
    return { error: 'An unexpected error occurred' };
  }
}
