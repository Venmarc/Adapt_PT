'use client';

import { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, CheckCircle2, Trophy, Award, Sparkles } from 'lucide-react';
import HabitCard from './habit-card';
import HabitForm from './habit-form';
import { createHabit, updateHabit, deleteHabit, logHabit, HabitInput, HabitLogInput } from '@/app/actions/habit-actions';

type HabitsClientProps = {
  initialHabits: any[];
  initialLogs: any[];
};

// Local date format YYYY-MM-DD
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HabitsClient({ initialHabits, initialLogs }: HabitsClientProps) {
  // Sync Server Components Hydration Props to state
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // Selected date for logging (default to local today)
  const [selectedDateStr, setSelectedDateStr] = useState(() => getLocalDateString(new Date()));

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<'active' | 'archived'>('active');

  // Modal / Form trigger states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  // Generate a list of the last 7 calendar days in local time
  const [rollingDays, setRollingDays] = useState<{ dayName: string; dayNum: string; dateStr: string }[]>([]);

  useEffect(() => {
    const days = [];
    const today = new Date();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push({
        dayName: weekdayNames[d.getDay()],
        dayNum: String(d.getDate()),
        dateStr: getLocalDateString(d),
      });
    }
    setRollingDays(days);
  }, []);

  // CRUD Handler - Create
  const handleCreateHabitSubmit = async (data: HabitInput) => {
    const res = await createHabit(data);
    if (res.error) {
      alert(res.error);
    }
  };

  // CRUD Handler - Update
  const handleUpdateHabitSubmit = async (data: HabitInput) => {
    if (!editingHabit) return;
    const res = await updateHabit(editingHabit.id, data);
    if (res.error) {
      alert(res.error);
    }
    setEditingHabit(null);
  };

  // CRUD Handler - Delete
  const handleDeleteHabit = async (id: string) => {
    const res = await deleteHabit(id);
    if (res.error) {
      alert(res.error);
    }
  };

  // CRUD Handler - Log (with Optimistic State Updates)
  const handleLogHabit = async (logInput: HabitLogInput) => {
    // 1. Snapshot previous logs for rollback
    const previousLogs = [...logs];

    // 2. Perform Optimistic Update
    setLogs(prev => {
      const existingIdx = prev.findIndex(
        l => l.habit_id === logInput.habit_id && l.logged_date === logInput.logged_date
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          completed: logInput.completed,
          count: logInput.count,
          notes: logInput.notes,
          difficulty: logInput.difficulty,
          context_tags: logInput.context_tags,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            user_id: 'temp-user',
            ...logInput,
          },
        ];
      }
    });

    // 3. Call Server Action in background
    const res = await logHabit(logInput);
    if (res.error) {
      // Rollback on failure
      setLogs(previousLogs);
      alert(res.error);
    }
  };

  const handleOpenEdit = (habit: any) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  // Filtering Logic
  const filteredHabits = habits.filter(habit => {
    // Filter active vs archived
    if (activeStatus === 'active' && !habit.is_active) return false;
    if (activeStatus === 'archived' && habit.is_active) return false;

    // Filter by category
    if (activeCategory !== 'All' && habit.category !== activeCategory) return false;

    // If selected date is NOT today, we only show habits that are active or were active on that date.
    // For this MVP, we show all active habits.
    return true;
  });

  // Unique categories in dataset (excluding custom inputs)
  const categories = ['All', 'Health', 'Fitness', 'Mindfulness', 'Routine', 'Growth'];

  // Calculate global weekly completion progress stats
  const totalActive = habits.filter(h => h.is_active).length;
  const loggedToday = logs.filter(l => l.logged_date === selectedDateStr && l.completed).length;
  const dailyCompletionRate = totalActive > 0 ? Math.round((loggedToday / totalActive) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24 md:pb-12">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f23] pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-success animate-soft-pulse" />
            Habits Operating System
          </h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Build consistency, configure recurrence rules, and track daily progress.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHabit(null);
            setIsFormOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-brand-success hover:bg-brand-success/90 text-[#030303] text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-success/15 hover:shadow-brand-success/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Create Habit
        </button>
      </div>

      {/* Analytics Brief Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#1f1f23] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-success/10 flex items-center justify-center border border-brand-success/20">
            <CheckCircle2 className="w-6 h-6 text-brand-success" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-semibold uppercase tracking-wider">Today's Progress</p>
            <p className="text-xl font-black text-white mt-0.5">{loggedToday} / {totalActive} Done</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#1f1f23] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Trophy className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-semibold uppercase tracking-wider">Daily Adherence</p>
            <p className="text-xl font-black text-white mt-0.5">{dailyCompletionRate}% Completion</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#1f1f23] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-semibold uppercase tracking-wider">Total Active Habits</p>
            <p className="text-xl font-black text-white mt-0.5">{totalActive} Habits Tracked</p>
          </div>
        </div>
      </div>

      {/* Date Rolling Selector Widget */}
      <div className="p-4 rounded-2xl bg-[#09090b] border border-[#1f1f23] space-y-3">
        <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider px-1">Select Logging Date</span>
        <div className="grid grid-cols-7 gap-2">
          {rollingDays.map((day) => {
            const isSelected = selectedDateStr === day.dateStr;
            const completedCount = logs.filter(l => l.logged_date === day.dateStr && l.completed).length;
            const hasLogs = completedCount > 0;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-success border-brand-success text-[#030303] shadow-md shadow-brand-success/15 font-black scale-105'
                    : 'bg-[#0e0e11] border-[#1c1c22] text-[#a1a1aa] hover:border-[#27272a] hover:bg-[#15151a]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{day.dayName}</span>
                <span className="text-base font-black leading-none">{day.dayNum}</span>
                
                {/* Visual completion dot marker */}
                {hasLogs && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                    isSelected ? 'bg-black' : 'bg-brand-success'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-card-hover border-[#27272a] text-white'
                  : 'bg-[#0e0e11]/40 border-[#1f1f23] text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#09090b] border border-[#1f1f23] rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStatus === 'active'
                ? 'bg-[#15151a] text-white border border-[#27272a]'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveStatus('archived')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStatus === 'archived'
                ? 'bg-[#15151a] text-white border border-[#27272a]'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Grid of habits */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logs}
              selectedDateStr={selectedDateStr}
              onLog={handleLogHabit}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 border border-dashed border-[#1f1f23] rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#15151a] flex items-center justify-center border border-[#1f1f23]">
            <SlidersHorizontal className="w-5 h-5 text-[#52525b]" />
          </div>
          <div>
            <h5 className="font-bold text-white text-base">No habits found</h5>
            <p className="text-xs text-[#52525b] max-w-xs mt-1">
              Create your first habit or adjust your active filters to start tracking your daily progress.
            </p>
          </div>
        </div>
      )}

      {/* Habits Modal Form */}
      <HabitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingHabit ? handleUpdateHabitSubmit : handleCreateHabitSubmit}
        initialData={editingHabit}
        title={editingHabit ? 'Edit Habit Configuration' : 'Create New Habit'}
      />
    </div>
  );
}
