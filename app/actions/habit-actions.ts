'use server';

import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { habitInputSchema, habitLogInputSchema } from '@/app/lib/validation';

export type HabitInput = z.infer<typeof habitInputSchema>;
export type HabitLogInput = z.infer<typeof habitLogInputSchema>;

/**
 * Creates a new habit for the authenticated user.
 */
export async function createHabit(input: HabitInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const parsed = habitInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues.map(e => e.message).join(', ') };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('habits')
      .insert({
        clerk_id: userId,
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        recurrence: parsed.data.recurrence,
        target_count: parsed.data.target_count,
        unit: parsed.data.unit,
        is_active: parsed.data.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return { error: `Database error: ${error.message}` };
    }

    revalidatePath('/habits');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in createHabit action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Updates an existing habit.
 */
export async function updateHabit(id: string, input: Partial<HabitInput>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('habits')
      .select('id')
      .eq('id', id)
      .eq('clerk_id', userId)
      .single();

    if (fetchErr || !existing) {
      return { error: 'Habit not found or unauthorized' };
    }

    const { data, error } = await supabase
      .from('habits')
      .update({
        name: input.name,
        description: input.description,
        category: input.category,
        recurrence: input.recurrence,
        target_count: input.target_count,
        unit: input.unit,
        is_active: input.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      return { error: `Database error: ${error.message}` };
    }

    revalidatePath('/habits');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in updateHabit action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a habit and all of its associated logs.
 */
export async function deleteHabit(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('habits')
      .select('id')
      .eq('id', id)
      .eq('clerk_id', userId)
      .single();

    if (fetchErr || !existing) {
      return { error: 'Habit not found or unauthorized' };
    }

    // 1. Delete associated logs
    const { error: logsError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', id);

    if (logsError) {
      console.error('Error deleting habit logs:', logsError);
      return { error: `Failed to delete logs: ${logsError.message}` };
    }

    // 2. Delete the habit
    const { error: habitError } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (habitError) {
      console.error('Error deleting habit:', habitError);
      return { error: `Failed to delete habit: ${habitError.message}` };
    }

    revalidatePath('/habits');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteHabit action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Creates or updates a daily log entry for a specific habit.
 */
export async function logHabit(input: HabitLogInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const parsed = habitLogInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues.map(e => e.message).join(', ') };
    }

    const supabase = createSupabaseServiceClient();

    // Verify that the habit belongs to the user
    const { data: habit, error: habitErr } = await supabase
      .from('habits')
      .select('id')
      .eq('id', parsed.data.habit_id)
      .eq('clerk_id', userId)
      .single();

    if (habitErr || !habit) {
      return { error: 'Unauthorized habit access' };
    }

    // Check if a log entry already exists for this habit on this date
    const { data: existingLog, error: logFetchErr } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', parsed.data.habit_id)
      .eq('logged_date', parsed.data.logged_date)
      .eq('clerk_id', userId)
      .maybeSingle();

    let resultError;
    let resultData;

    if (existingLog) {
      // Update
      const { data, error } = await supabase
        .from('habit_logs')
        .update({
          completed: parsed.data.completed,
          count: parsed.data.count,
          notes: parsed.data.notes,
          difficulty: parsed.data.difficulty,
          context_tags: parsed.data.context_tags,
        })
        .eq('id', existingLog.id)
        .select()
        .single();
      
      resultError = error;
      resultData = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: parsed.data.habit_id,
          clerk_id: userId,
          logged_date: parsed.data.logged_date,
          completed: parsed.data.completed,
          count: parsed.data.count,
          notes: parsed.data.notes,
          difficulty: parsed.data.difficulty,
          context_tags: parsed.data.context_tags,
        })
        .select()
        .single();
      
      resultError = error;
      resultData = data;
    }

    if (resultError) {
      console.error('Error logging habit entry:', resultError);
      return { error: `Database error: ${resultError.message}` };
    }

    revalidatePath('/habits');
    revalidatePath('/');
    return { success: true, data: resultData };
  } catch (err) {
    console.error('Unexpected error in logHabit action:', err);
    return { error: 'An unexpected error occurred' };
  }
}
