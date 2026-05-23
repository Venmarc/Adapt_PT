'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useWorkoutStore, WorkoutSet, ActiveExercise } from '@/app/hooks/use-workout-store';
import { getExercises, getLatestSetsForExercise, saveWorkout } from '@/app/actions/fitness-actions';
import { toast } from '@/app/hooks/use-toast';
import ExerciseSelector from './exercise-selector';
import { 
  Play, Trash2, Plus, Calendar, Clock, Edit3, X, Save, 
  ChevronRight, Dumbbell, AlertTriangle, Timer, Check, RefreshCw 
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string[] | null;
  is_custom: boolean;
}

export default function WorkoutLogger() {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSaving, startSaving] = useTransition();

  // Zustand state
  const {
    isActive,
    name,
    date,
    startTime,
    notes,
    exercises,
    updateWorkoutName,
    updateWorkoutNotes,
    updateWorkoutDate,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    setPreviousSets,
    cancelWorkout,
    finishWorkout,
  } = useWorkoutStore();

  // Active duration timer
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Rest Timer State (Strictly visual indicator)
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restMax, setRestMax] = useState<number>(90); // Default 90 seconds
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exercise list
  useEffect(() => {
    async function loadExercises() {
      const res = await getExercises();
      if (res.success && res.data) {
        setAllExercises(res.data);
      }
    }
    if (isActive) {
      loadExercises();
    }
  }, [isActive]);

  // Track workout duration
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const diffMs = Date.now() - startTime;
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      const formatted = hours > 0
        ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      setElapsedTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Fetch previous sets for exercises in workout
  useEffect(() => {
    if (!isActive) return;

    exercises.forEach(async (ex) => {
      // Check if previous data is already populated
      const hasPrevData = ex.sets.some((s) => s.previous !== undefined);
      if (hasPrevData) return;

      const res = await getLatestSetsForExercise(ex.id);
      if (res.success && res.data) {
        setPreviousSets(ex.id, res.data);
      }
    });
  }, [isActive, exercises.length]);

  // Rest Timer decrement logic
  useEffect(() => {
    if (restSeconds === null) return;

    if (restSeconds <= 0) {
      setRestSeconds(null);
      toast.success('Rest complete! Get ready for your next set.');
      return;
    }

    restTimerRef.current = setTimeout(() => {
      setRestSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [restSeconds]);

  if (!isActive) return null;

  // Handles starting / modifying rest timer upon set check-off
  const handleSetCompletionToggle = (exerciseId: string, setId: string, currentlyCompleted: boolean) => {
    const nextCompleted = !currentlyCompleted;
    updateSet(exerciseId, setId, { completed: nextCompleted });

    if (nextCompleted) {
      // Start rest timer (visual indicator)
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      setRestMax(90);
      setRestSeconds(90);
    }
  };

  const handleAdjustRest = (amount: number) => {
    setRestSeconds((prev) => {
      if (prev === null) return null;
      const next = prev + amount;
      if (next > restMax) setRestMax(next);
      return Math.max(0, next);
    });
  };

  const handleSave = () => {
    if (exercises.length === 0) {
      toast.error('Please add at least one exercise.');
      return;
    }

    startSaving(async () => {
      const durationMin = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
      
      const payload = {
        name,
        date,
        duration: durationMin,
        notes,
        exercises: exercises.map((ex) => ({
          exercise_id: ex.id,
          sets: ex.sets.map((s) => ({
            reps: Number(s.reps) || 0,
            weight_kg: Number(s.weight_kg) || 0,
            rpe: s.rpe ? Number(s.rpe) : null,
            notes: s.notes || null,
            completed: s.completed,
          })),
        })),
      };

      const res = await saveWorkout(payload);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Workout logged successfully.');
        finishWorkout();
      }
    });
  };

  // Rest Timer visual ring calculation
  const restPercentage = restSeconds !== null ? (restSeconds / restMax) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen text-[#f4f4f5] pb-24">
      {/* Top Banner / Workout Meta */}
      <header className="sticky top-16 md:top-0 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] p-4 md:p-6 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => updateWorkoutName(e.target.value)}
              className="text-xl md:text-2xl font-bold bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-brand-success outline-none pb-0.5 max-w-sm transition-colors text-white"
              placeholder="Workout Name"
            />
            <Edit3 className="w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#a1a1aa]">
            <span className="flex items-center gap-1.5 bg-[#18181b] px-2.5 py-1 rounded-full border border-[#27272a]">
              <Calendar className="w-3.5 h-3.5 text-brand-success" />
              <input
                type="date"
                value={date}
                onChange={(e) => updateWorkoutDate(e.target.value)}
                className="bg-transparent text-[#f4f4f5] outline-none"
              />
            </span>
            <span className="flex items-center gap-1.5 bg-[#18181b] px-2.5 py-1 rounded-full border border-[#27272a]">
              <Clock className="w-3.5 h-3.5 text-brand-success" />
              {elapsedTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="px-4 py-2 border border-red-900/50 hover:bg-red-950/20 text-red-500 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-brand-success text-black hover:bg-brand-success-hover rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Finish Workout
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Workout Notes */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4">
          <textarea
            placeholder="Add general workout notes here... (e.g. felt strong, slight fatigue in shoulders)"
            value={notes}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
            className="w-full bg-transparent border-0 outline-none resize-none text-sm text-[#f4f4f5] placeholder-[#71717a] h-12"
          />
        </div>

        {/* Exercises list */}
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#27272a] bg-[#09090b] rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-success/10 flex items-center justify-center text-brand-success">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No exercises added yet</p>
              <p className="text-xs text-[#a1a1aa] mt-1">Start by adding exercises to your active session.</p>
            </div>
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="py-2 px-4 bg-brand-success text-black font-semibold text-sm rounded-xl flex items-center gap-1.5 hover:bg-brand-success-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((ex, exerciseIndex) => (
              <div 
                key={ex.id} 
                className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4 transition-colors"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between border-b border-[#1f1f22] pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500">{exerciseIndex + 1}.</span>
                      {ex.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-success bg-brand-success/15 px-1.5 py-0.5 rounded">
                      {ex.category}
                    </span>
                  </div>

                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="p-1.5 hover:bg-red-950/20 text-[#a1a1aa] hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider border-b border-[#27272a] pb-2">
                        <th className="py-2 w-12 text-center">Set</th>
                        <th className="py-2 pl-2">Previous</th>
                        <th className="py-2 pl-2 w-28">Weight (kg)</th>
                        <th className="py-2 pl-2 w-28">Reps</th>
                        <th className="py-2 pl-2 w-24">RPE</th>
                        <th className="py-2 w-16 text-center">Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e22]">
                      {ex.sets.map((set, setIndex) => (
                        <tr 
                          key={set.id} 
                          className={`group transition-colors ${set.completed ? 'bg-brand-success/5' : 'hover:bg-card-hover/20'}`}
                        >
                          <td className="py-3 text-center text-sm font-semibold text-zinc-500 flex items-center justify-center gap-1.5 h-[52px]">
                            {setIndex + 1}
                          </td>
                          <td className="py-3 text-sm text-[#71717a] pl-2">
                            {set.previous || '—'}
                          </td>
                          <td className="py-3 pl-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="0"
                              value={set.weight_kg}
                              onChange={(e) => updateSet(ex.id, set.id, { weight_kg: e.target.value })}
                              disabled={set.completed}
                              className="w-20 bg-[#18181b] border border-[#27272a] focus:border-brand-success disabled:opacity-50 text-[#f4f4f5] text-sm text-center py-1 rounded-md outline-none"
                            />
                          </td>
                          <td className="py-3 pl-2">
                            <input
                              type="number"
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) => updateSet(ex.id, set.id, { reps: e.target.value })}
                              disabled={set.completed}
                              className="w-20 bg-[#18181b] border border-[#27272a] focus:border-brand-success disabled:opacity-50 text-[#f4f4f5] text-sm text-center py-1 rounded-md outline-none"
                            />
                          </td>
                          <td className="py-3 pl-2">
                            <select
                              value={set.rpe || ''}
                              onChange={(e) => updateSet(ex.id, set.id, { rpe: e.target.value ? Number(e.target.value) : null })}
                              disabled={set.completed}
                              className="w-16 bg-[#18181b] border border-[#27272a] focus:border-brand-success disabled:opacity-50 text-[#f4f4f5] text-xs py-1 px-1 rounded-md outline-none text-center"
                            >
                              <option value="">RPE</option>
                              {Array.from({ length: 10 }, (_, i) => 10 - i).map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 text-center relative">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleSetCompletionToggle(ex.id, set.id, set.completed)}
                                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                  set.completed
                                    ? 'bg-brand-success border-brand-success text-black'
                                    : 'border-[#27272a] hover:border-brand-success/50 bg-[#18181b] text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <button
                                onClick={() => removeSet(ex.id, set.id)}
                                className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => addSet(ex.id)}
                  className="py-1.5 w-full bg-[#18181b] hover:bg-[#202024] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Set
                </button>
              </div>
            ))}

            {/* Bottom Add Exercise Trigger */}
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="w-full py-4 border border-dashed border-[#27272a] hover:border-brand-success/50 bg-[#09090b] rounded-2xl flex items-center justify-center gap-2 text-sm text-[#a1a1aa] hover:text-white font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 text-brand-success animate-soft-pulse" />
              Add Exercise
            </button>
          </div>
        )}
      </main>

      {/* Slide-over Exercise Selector */}
      <ExerciseSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(ex) => {
          addExercise(ex);
          setIsSelectorOpen(false);
        }}
        exercises={allExercises}
        onCustomExerciseCreated={(newEx) => {
          setAllExercises((prev) => [...prev, newEx]);
        }}
      />

      {/* Floating Visual Rest Timer */}
      {restSeconds !== null && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-[#09090b]/90 border border-brand-success/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-2xl p-4 w-64 backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            {/* SVG Progress Circle */}
            <svg className="absolute w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-zinc-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-brand-success transition-all duration-1000"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * restPercentage) / 100}
              />
            </svg>
            <Timer className="w-5 h-5 text-brand-success" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="text-xs text-[#a1a1aa] font-semibold flex items-center justify-between">
              <span>Resting</span>
              <button 
                onClick={() => setRestSeconds(null)}
                className="text-[#71717a] hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-lg font-bold text-white font-mono leading-none">
              {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-1.5">
              <button
                onClick={() => handleAdjustRest(-30)}
                className="text-[10px] font-bold px-2 py-1 rounded bg-[#18181b] border border-[#27272a] hover:bg-card-hover text-[#a1a1aa] hover:text-white transition-colors"
              >
                -30s
              </button>
              <button
                onClick={() => handleAdjustRest(30)}
                className="text-[10px] font-bold px-2 py-1 rounded bg-[#18181b] border border-[#27272a] hover:bg-card-hover text-[#a1a1aa] hover:text-white transition-colors"
              >
                +30s
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Discard Workout?
            </h4>
            <p className="text-sm text-[#a1a1aa]">
              Are you sure you want to cancel the current session? Your progress will be lost.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-[#18181b] border border-[#27272a] hover:bg-card-hover text-[#a1a1aa] hover:text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cancelWorkout();
                  setShowCancelConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
