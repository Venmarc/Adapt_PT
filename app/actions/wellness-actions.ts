'use server';

import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { wellnessInputSchema } from '@/app/lib/validation';

export type WellnessInput = z.infer<typeof wellnessInputSchema>;

/**
 * Fetch recent wellness entries for the logged-in user.
 */
export async function getWellnessEntries(limit: number = 30) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching wellness entries:', error);
      return { error: `Database error: ${error.message}` };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in getWellnessEntries:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Fetch a wellness entry for a specific date.
 */
export async function getWellnessEntryForDate(dateStr: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', dateStr)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wellness entry for date:', error);
      return { error: `Database error: ${error.message}` };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in getWellnessEntryForDate:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Insert or update a daily wellness log.
 */
export async function upsertWellnessEntry(input: WellnessInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const parsed = wellnessInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues.map(e => e.message).join(', ') };
    }

    const supabase = createSupabaseServiceClient();

    // Check if entry already exists for this date and user
    const { data: existing, error: fetchErr } = await supabase
      .from('wellness_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', parsed.data.entry_date)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error checking existing wellness entry:', fetchErr);
      return { error: `Database error: ${fetchErr.message}` };
    }

    let resultError;
    let resultData;

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('wellness_entries')
        .update({
          mood: parsed.data.mood,
          energy: parsed.data.energy,
          sleep_hours: parsed.data.sleep_hours,
          sleep_quality: parsed.data.sleep_quality,
          notes: parsed.data.notes,
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      resultError = error;
      resultData = data;
    } else {
      // Insert new entry
      const { data, error } = await supabase
        .from('wellness_entries')
        .insert({
          user_id: userId,
          entry_date: parsed.data.entry_date,
          mood: parsed.data.mood,
          energy: parsed.data.energy,
          sleep_hours: parsed.data.sleep_hours,
          sleep_quality: parsed.data.sleep_quality,
          notes: parsed.data.notes,
        })
        .select()
        .single();
      
      resultError = error;
      resultData = data;
    }

    if (resultError) {
      console.error('Error saving wellness entry:', resultError);
      return { error: `Database error: ${resultError.message}` };
    }

    revalidatePath('/wellness');
    revalidatePath('/');
    return { success: true, data: resultData };
  } catch (err) {
    console.error('Unexpected error in upsertWellnessEntry action:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a wellness log.
 */
export async function deleteWellnessEntry(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const supabase = createSupabaseServiceClient();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('wellness_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return { error: 'Wellness entry not found or unauthorized' };
    }

    const { error } = await supabase
      .from('wellness_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wellness entry:', error);
      return { error: `Failed to delete entry: ${error.message}` };
    }

    revalidatePath('/wellness');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteWellnessEntry action:', err);
    return { error: 'An unexpected error occurred' };
  }
}
