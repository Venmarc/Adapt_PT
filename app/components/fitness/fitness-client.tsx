'use client';

import React, { useState, useTransition } from 'react';
import { useWorkoutStore } from '@/app/hooks/use-workout-store';
import { deleteWorkout } from '@/app/actions/fitness-actions';
import { toast } from '@/app/hooks/use-toast';
import WorkoutLogger from './workout-logger';
import { 
  Dumbbell, Clock, Flame, Calendar, Plus, Trash2, 
  ChevronDown, ChevronUp, Play, Trophy, Heart, Activity, User 
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string[] | null;
  is_custom: boolean;
}

interface WorkoutExercise {
  id: string;
  order_index: number;
  sets: Array<{
    reps: number;
    weight_kg: number;
    rpe: number | null;
    notes: string | null;
  }>;
  exercise: {
    id: string;
    name: string;
    category: string;
    muscle_group: string[] | null;
  } | null;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  notes: string | null;
  total_duration_minutes: number | null;
  total_volume_kg: number | null;
  created_at: string | null;
  workout_exercises: WorkoutExercise[];
}

interface FitnessClientProps {
  initialExercises: Exercise[];
  initialWorkouts: Workout[];
}

const TEMPLATE_DEFS = [
  {
    name: 'Chest Focus',
    description: 'Target your pectoral muscles using free weights and bodyweight.',
    category: 'Push',
    exercises: ['Barbell Bench Press', 'Pushups', 'Incline Dumbbell Bench Press', 'Dips'],
    icon: Activity,
    color: 'border-blue-500/20 text-blue-400 bg-blue-500/5'
  },
  {
    name: 'Shoulder Focus',
    description: 'Build robust, stable, and strong shoulders.',
    category: 'Push',
    exercises: ['Overhead Press', 'Pike Pushups', 'Lateral Raise', 'Face Pull'],
    icon: Flame,
    color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'
  },
  {
    name: 'Glutes Focus',
    description: 'Activate and strengthen glutes with bridges and split squats.',
    category: 'Legs',
    exercises: ['Glute Bridge', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Donkey Kicks'],
    icon: Heart,
    color: 'border-pink-500/20 text-pink-400 bg-pink-500/5'
  },
  {
    name: 'Legs Focus',
    description: 'Complete lower body development.',
    category: 'Legs',
    exercises: ['Barbell Squat', 'Walking Lunges', 'Standing Calf Raise'],
    icon: Trophy,
    color: 'border-green-500/20 text-green-400 bg-green-500/5'
  },
  {
    name: 'Arms Focus',
    description: 'High-volume isolation training for biceps and triceps.',
    category: 'Pull/Push',
    exercises: ['Dumbbell Bicep Curl', 'Hammer Curl', 'Cable Tricep Pushdown', 'Diamond Pushups'],
    icon: Dumbbell,
    color: 'border-amber-500/20 text-amber-400 bg-amber-500/5'
  },
  {
    name: 'Full Body Routine',
    description: 'High-efficiency compound workout perfect for home.',
    category: 'Full Body',
    exercises: ['Bodyweight Squat', 'Pushups', 'Pull-up', 'Russian Twists', 'Burpee'],
    icon: User,
    color: 'border-purple-500/20 text-purple-400 bg-purple-500/5'
  }
];

export default function FitnessClient({
  initialExercises,
  initialWorkouts,
}: FitnessClientProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
  const [isDeleting, startDeleting] = useTransition();

  const { isActive, startWorkout } = useWorkoutStore();

  const handleStartEmpty = () => {
    startWorkout('Empty Workout', []);
    toast.success('Ready to build custom routine!');
  };

  const handleStartTemplate = (templateName: string, exerciseNames: string[]) => {
    // Map template names to DB exercise objects
    const matched = exerciseNames
      .map((name) => initialExercises.find((ex) => ex.name.toLowerCase() === name.toLowerCase()))
      .filter((ex): ex is Exercise => !!ex)
      .map((ex) => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
      }));

    startWorkout(templateName, matched);
    toast.success(`Loaded template: ${templateName}`);
  };

  const handleDelete = (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout? This action is permanent.')) return;

    startDeleting(async () => {
      const res = await deleteWorkout(workoutId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Workout session removed.');
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      }
    });
  };

  const toggleExpand = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  // Format date nicely (e.g., "Monday, May 21")
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // If a workout is active, display the logger
  if (isActive) {
    return <WorkoutLogger />;
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-8 bg-black text-[#f4f4f5] pb-20">
      
      {/* Page Title */}
      <div className="space-y-1 mt-16 md:mt-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-6.5 h-6.5 text-brand-success" />
          Fitness Logger
        </h1>
        <p className="text-xs text-[#a1a1aa]">Log your training sessions, track volumes, and monitor progressive overload</p>
      </div>

      {/* Manual Start Banner */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Start Empty Workout</h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">Build a completely custom workout routine by selecting exercises manually.</p>
        </div>
        <button
          onClick={handleStartEmpty}
          className="py-2.5 px-5 bg-brand-success hover:bg-brand-success-hover text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Start Session
        </button>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <div className="border-b border-[#27272a] pb-2">
          <h2 className="text-base font-bold text-white">Preset Workout Templates</h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5 font-medium">Quickly load templates populated with equipment-free or gym movements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_DEFS.map((temp) => {
            const Icon = temp.icon;
            return (
              <div 
                key={temp.name} 
                className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:translate-y-[-1px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{temp.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${temp.color}`}>
                      {temp.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">{temp.description}</p>
                  
                  {/* Exercises inside template preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {temp.exercises.map((exName) => (
                      <span 
                        key={exName} 
                        className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#f4f4f5] px-2 py-0.5 rounded-md font-semibold"
                      >
                        {exName}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartTemplate(temp.name, temp.exercises)}
                  className="w-full py-2 bg-[#18181b] hover:bg-card-hover border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-brand-success fill-brand-success" />
                  Load Routine
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="border-b border-[#27272a] pb-2">
          <h2 className="text-base font-bold text-white">Workouts History</h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5 font-medium">Review your historical logs and progressive overload metrics.</p>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-12 bg-[#09090b] border border-dashed border-[#27272a] rounded-2xl">
            <p className="text-sm text-[#a1a1aa]">No workouts logged yet</p>
            <p className="text-xs text-[#71717a] mt-1">Your logged training sessions will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((w) => {
              const isExpanded = !!expandedWorkouts[w.id];
              return (
                <div 
                  key={w.id} 
                  className="bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  {/* Workout Brief Row */}
                  <div 
                    onClick={() => toggleExpand(w.id)}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-card-hover/20 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-white text-sm md:text-base">{w.name}</h3>
                        <span className="flex items-center gap-1 text-[10px] text-[#71717a] font-semibold">
                          <Calendar className="w-3 h-3" />
                          {formatDate(w.date)}
                        </span>
                      </div>

                      {/* Brief exercise name list preview */}
                      <p className="text-xs text-[#a1a1aa] truncate max-w-xl">
                        {w.workout_exercises.map(we => we.exercise?.name).filter(Boolean).join(', ') || 'No exercises'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#1e1e22] pt-3 md:pt-0">
                      {/* Telemetry metrics */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-[#f4f4f5]">
                        {w.total_duration_minutes && (
                          <span className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-brand-success" />
                            {w.total_duration_minutes} min
                          </span>
                        )}
                        {w.total_volume_kg && w.total_volume_kg > 0 ? (
                          <span className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-lg">
                            <Flame className="w-3.5 h-3.5 text-brand-success" />
                            {w.total_volume_kg.toLocaleString()} kg
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(w.id);
                          }}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg hover:bg-red-950/20 text-[#71717a] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-1.5 rounded-lg hover:bg-[#18181b] text-[#a1a1aa]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workout Expanded Exercises List */}
                  {isExpanded && (
                    <div className="bg-[#050506] border-t border-[#1e1e22] p-4 md:p-5 space-y-4">
                      {w.notes && (
                        <div className="text-xs text-[#a1a1aa] bg-[#121214] border border-[#27272a] rounded-lg p-3 italic">
                          <strong>Notes: </strong>{w.notes}
                        </div>
                      )}

                      <div className="space-y-3.5">
                        {w.workout_exercises.map((we, index) => (
                          <div key={we.id} className="space-y-1.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="text-zinc-600">{index + 1}.</span>
                              {we.exercise?.name || 'Unknown Exercise'}
                              <span className="text-[9px] font-bold tracking-wider uppercase bg-brand-success/10 text-brand-success px-1 py-0.2 rounded">
                                {we.exercise?.category}
                              </span>
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-4">
                              {we.sets.map((set, setIndex) => (
                                <div 
                                  key={setIndex}
                                  className="bg-[#121214] border border-[#27272a] rounded-lg p-2 flex flex-col justify-center space-y-0.5"
                                >
                                  <span className="text-[9px] text-[#71717a] uppercase font-bold">Set {setIndex + 1}</span>
                                  <span className="text-xs text-white font-semibold font-mono">
                                    {set.weight_kg > 0 ? `${set.weight_kg}kg × ` : ''}{set.reps} reps
                                  </span>
                                  {set.rpe && (
                                    <span className="text-[9px] text-[#a1a1aa] font-medium">RPE {set.rpe}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
