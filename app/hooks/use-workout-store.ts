import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkoutSet {
  id: string;
  reps: string | number;
  weight_kg: string | number;
  rpe: number | null;
  notes: string;
  completed: boolean;
  previous?: string;
}

export interface ActiveExercise {
  id: string; // exercise_id in db
  name: string;
  category: string;
  sets: WorkoutSet[];
}

interface WorkoutState {
  isActive: boolean;
  name: string;
  date: string;
  startTime: number | null;
  notes: string;
  exercises: ActiveExercise[];
  
  // Actions
  startWorkout: (name: string, templateExercises?: Array<{ id: string; name: string; category: string }>) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;
  updateWorkoutName: (name: string) => void;
  updateWorkoutNotes: (notes: string) => void;
  updateWorkoutDate: (date: string) => void;
  addExercise: (exercise: { id: string; name: string; category: string }) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  setPreviousSets: (exerciseId: string, previousSets: Array<{ reps: number; weight_kg: number; rpe?: number | null }>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      isActive: false,
      name: 'Empty Workout',
      date: new Date().toISOString().split('T')[0],
      startTime: null,
      notes: '',
      exercises: [],

      startWorkout: (name, templateExercises = []) => {
        const initialExercises = templateExercises.map((te) => ({
          id: te.id,
          name: te.name,
          category: te.category,
          sets: [
            {
              id: generateId(),
              reps: '',
              weight_kg: '',
              rpe: null,
              notes: '',
              completed: false,
            },
          ],
        }));

        set({
          isActive: true,
          name: name || 'Empty Workout',
          date: new Date().toISOString().split('T')[0],
          startTime: Date.now(),
          notes: '',
          exercises: initialExercises,
        });
      },

      cancelWorkout: () => {
        set({
          isActive: false,
          name: 'Empty Workout',
          date: new Date().toISOString().split('T')[0],
          startTime: null,
          notes: '',
          exercises: [],
        });
      },

      finishWorkout: () => {
        set({
          isActive: false,
          name: 'Empty Workout',
          date: new Date().toISOString().split('T')[0],
          startTime: null,
          notes: '',
          exercises: [],
        });
      },

      updateWorkoutName: (name) => set({ name }),
      updateWorkoutNotes: (notes) => set({ notes }),
      updateWorkoutDate: (date) => set({ date }),

      addExercise: (exercise) => {
        set((state) => {
          // If exercise is already in active workout, don't duplicate it
          const exists = state.exercises.some((e) => e.id === exercise.id);
          if (exists) return state;

          const newExercise: ActiveExercise = {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            sets: [
              {
                id: generateId(),
                reps: '',
                weight_kg: '',
                rpe: null,
                notes: '',
                completed: false,
              },
            ],
          };

          return {
            exercises: [...state.exercises, newExercise],
          };
        });
      },

      removeExercise: (exerciseId) => {
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== exerciseId),
        }));
      },

      addSet: (exerciseId) => {
        set((state) => ({
          exercises: state.exercises.map((e) => {
            if (e.id !== exerciseId) return e;

            // Copy reps and weight of the last set if available, to make logging faster
            const lastSet = e.sets[e.sets.length - 1];
            const newSet: WorkoutSet = {
              id: generateId(),
              reps: lastSet ? lastSet.reps : '',
              weight_kg: lastSet ? lastSet.weight_kg : '',
              rpe: lastSet ? lastSet.rpe : null,
              notes: '',
              completed: false,
            };

            return {
              ...e,
              sets: [...e.sets, newSet],
            };
          }),
        }));
      },

      removeSet: (exerciseId, setId) => {
        set((state) => ({
          exercises: state.exercises.map((e) => {
            if (e.id !== exerciseId) return e;

            const filteredSets = e.sets.filter((s) => s.id !== setId);
            
            // If we deleted all sets, keep at least one empty set
            const finalSets = filteredSets.length > 0 
              ? filteredSets 
              : [{
                  id: generateId(),
                  reps: '',
                  weight_kg: '',
                  rpe: null,
                  notes: '',
                  completed: false,
                }];

            return {
              ...e,
              sets: finalSets,
            };
          }),
        }));
      },

      updateSet: (exerciseId, setId, updates) => {
        set((state) => ({
          exercises: state.exercises.map((e) => {
            if (e.id !== exerciseId) return e;

            return {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            };
          }),
        }));
      },

      setPreviousSets: (exerciseId, previousSets) => {
        set((state) => ({
          exercises: state.exercises.map((e) => {
            if (e.id !== exerciseId) return e;

            // Map standard database sets to readable strings like "8 x 70kg"
            const setsWithPrev = e.sets.map((s, index) => {
              const prev = previousSets && previousSets[index];
              const prevStr = prev 
                ? `${prev.reps} × ${prev.weight_kg}kg${prev.rpe ? ` (RPE ${prev.rpe})` : ''}`
                : '—';
              return {
                ...s,
                previous: prevStr,
              };
            });

            return {
              ...e,
              sets: setsWithPrev,
            };
          }),
        }));
      },
    }),
    {
      name: 'momentum-active-workout',
      partialize: (state) => ({
        isActive: state.isActive,
        name: state.name,
        date: state.date,
        startTime: state.startTime,
        notes: state.notes,
        exercises: state.exercises,
      }),
    }
  )
);
