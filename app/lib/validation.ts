import { z } from 'zod';

// --- HABITS SCHEMAS ---
export const recurrenceConfigSchema = z.object({
  type: z.enum(['daily', 'weekly', 'interval']),
  days: z.array(z.number()).optional(), // 0 = Sunday, 1 = Monday, etc.
  times_per_week: z.number().optional(),
  every_x_days: z.number().optional(),
});

export const habitInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  recurrence: recurrenceConfigSchema,
  target_count: z.number().min(1, 'Target count must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  is_active: z.boolean(),
});

export const habitLogInputSchema = z.object({
  habit_id: z.string().uuid(),
  logged_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  completed: z.boolean(),
  count: z.number().nullable().optional(),
  notes: z.string().optional().nullable(),
  difficulty: z.number().min(1).max(5).optional().nullable(),
  context_tags: z.array(z.string()).optional().nullable(),
});

// --- FITNESS SCHEMAS ---
export const setSchema = z.object({
  reps: z.number().int().min(0),
  weight_kg: z.number().min(0),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});

export const workoutExerciseInputSchema = z.object({
  exercise_id: z.string().uuid(),
  sets: z.array(setSchema),
});

export const saveWorkoutSchema = z.object({
  workoutId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Workout name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  duration: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  exercises: z.array(workoutExerciseInputSchema),
});

// --- WELLNESS SCHEMAS ---
export const wellnessInputSchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mood: z.number().min(1).max(5, 'Mood must be between 1 and 5'),
  energy: z.number().min(1).max(5, 'Energy must be between 1 and 5'),
  sleep_hours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24'),
  sleep_quality: z.number().min(1).max(5, 'Sleep quality must be between 1 and 5'),
  notes: z.string().optional().nullable(),
});
