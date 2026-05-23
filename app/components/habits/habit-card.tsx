'use client';

import { useState } from 'react';
import { Flame, Plus, Minus, Check, Edit2, Trash2, Tag, ChevronDown, ChevronUp, Star, Loader2 } from 'lucide-react';
import { HabitLogInput } from '@/app/actions/habit-actions';

type HabitCardProps = {
  habit: any;
  logs: any[];
  selectedDateStr: string;
  onLog: (input: HabitLogInput) => Promise<void>;
  onEdit: (habit: any) => void;
  onDelete: (id: string) => Promise<void>;
};

const SUGGESTED_TAGS = ['work', 'travel', 'morning', 'night', 'weekend', 'home'];

export default function HabitCard({ habit, logs, selectedDateStr, onLog, onEdit, onDelete }: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Find log for the selected date
  const dayLog = logs.find(l => l.habit_id === habit.id && l.logged_date === selectedDateStr);
  const isCompleted = dayLog?.completed || false;
  const currentCount = dayLog?.count !== undefined && dayLog?.count !== null ? Number(dayLog.count) : 0;

  // Local state for detail logging form
  const [notes, setNotes] = useState(dayLog?.notes || '');
  const [difficulty, setDifficulty] = useState(dayLog?.difficulty || 3);
  const [selectedTags, setSelectedTags] = useState<string[]>(dayLog?.context_tags || []);

  // Calculate streak
  const calculateStreak = () => {
    const habitLogs = logs
      .filter(l => l.habit_id === habit.id && l.completed)
      .map(l => l.logged_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (habitLogs.length === 0) return 0;

    let streak = 0;
    const logSet = new Set(habitLogs);
    
    // Start tracking back from today/selectedDate
    let traceDate = new Date(selectedDateStr);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const todayStr = formatDate(traceDate);
    traceDate.setDate(traceDate.getDate() - 1);
    const yesterdayStr = formatDate(traceDate);

    // If not completed today and not completed yesterday, streak is 0
    if (!logSet.has(todayStr) && !logSet.has(yesterdayStr)) {
      return 0;
    }

    let dateToTrace = logSet.has(todayStr) ? new Date(selectedDateStr) : new Date(yesterdayStr);

    while (true) {
      const dateStr = formatDate(dateToTrace);
      if (logSet.has(dateStr)) {
        streak++;
        dateToTrace.setDate(dateToTrace.getDate() - 1);
      } else {
        // If it's a weekly habit, skip days that are not scheduled
        if (habit.recurrence?.type === 'weekly') {
          const dayOfWeek = dateToTrace.getDay();
          const isScheduled = habit.recurrence.days?.includes(dayOfWeek);
          if (!isScheduled) {
            dateToTrace.setDate(dateToTrace.getDate() - 1);
            continue;
          }
        }
        break; // Streak broken
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((currentCount / habit.target_count) * 100)
  );

  const handleQuickLog = async (newCount: number) => {
    setIsLogging(true);
    try {
      const completed = newCount >= habit.target_count;
      await onLog({
        habit_id: habit.id,
        logged_date: selectedDateStr,
        completed,
        count: newCount,
        notes: dayLog?.notes || null,
        difficulty: dayLog?.difficulty || null,
        context_tags: dayLog?.context_tags || null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const handleDetailLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    try {
      await onLog({
        habit_id: habit.id,
        logged_date: selectedDateStr,
        completed: habit.target_count === 1 ? !isCompleted : currentCount >= habit.target_count,
        count: habit.target_count === 1 ? (isCompleted ? 0 : 1) : currentCount,
        notes: notes || null,
        difficulty,
        context_tags: selectedTags,
      });
      setShowDetails(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this habit and all its logs?')) {
      setIsDeleting(true);
      try {
        await onDelete(habit.id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Color mappings based on category
  const categoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'health': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'fitness': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'mindfulness': return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'routine': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'growth': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400';
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-[#0e0e11] border transition-all ${
      isCompleted 
        ? 'border-brand-success/30 bg-[#0e120f]/30 shadow-lg shadow-brand-success/2'
        : 'border-[#1f1f23] hover:border-[#27272a]'
    }`}>
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${categoryColor(habit.category)}`}>
              {habit.category}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-black text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-500/20 text-orange-500 animate-soft-pulse" />
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-[#f4f4f5] leading-tight tracking-tight mt-1.5">
            {habit.name}
          </h4>
          {habit.description && (
            <p className="text-xs text-[#a1a1aa] line-clamp-1 mt-0.5">
              {habit.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-[#1a1a21] transition-all"
            title="Edit Habit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-[#ef4444] hover:bg-[#211215] transition-all disabled:opacity-50"
            title="Delete Habit"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress & Target Section */}
      <div className="mt-4 flex items-center justify-between gap-4">
        {habit.target_count === 1 ? (
          /* Yes/No Habit Toggle */
          <button
            onClick={() => handleQuickLog(isCompleted ? 0 : 1)}
            disabled={isLogging}
            className={`w-full py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isCompleted
                ? 'bg-brand-success/10 border-brand-success/30 text-brand-success'
                : 'bg-[#141418] border-[#222226] text-[#a1a1aa] hover:bg-[#1b1b22] hover:text-white'
            }`}
          >
            {isLogging ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-success" />
            ) : isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[3px]" />
                Completed Today
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
        ) : (
          /* Quantifiable Habit Counter */
          <div className="w-full flex items-center justify-between p-1 bg-[#141418] border border-[#222226] rounded-xl">
            <button
              onClick={() => handleQuickLog(Math.max(0, currentCount - 1))}
              disabled={isLogging || currentCount === 0}
              className="p-2 rounded-lg bg-[#1a1a21] border border-[#222226] text-[#a1a1aa] hover:text-white disabled:opacity-30 disabled:hover:text-[#a1a1aa] transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-center">
              <span className="text-sm font-black text-white">{currentCount}</span>
              <span className="text-xs text-[#a1a1aa] ml-1">/ {habit.target_count} {habit.unit}</span>
            </div>
            <button
              onClick={() => handleQuickLog(currentCount + 1)}
              disabled={isLogging}
              className="p-2 rounded-lg bg-brand-success text-black hover:bg-brand-success/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar (Only for quantifiable) */}
      {habit.target_count > 1 && (
        <div className="mt-3 w-full bg-[#1c1c21] rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${isCompleted ? 'bg-brand-success' : 'bg-brand-success/60'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Collapsible details log toggle */}
      <div className="mt-3.5 pt-3 border-t border-[#1f1f23]/50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#a1a1aa] transition-all"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              {dayLog?.notes || dayLog?.difficulty || dayLog?.context_tags?.length
                ? 'Edit logs detail'
                : 'Log notes, difficulty & context'}
            </>
          )}
        </button>

        {/* Collapsible Details Form */}
        {showDetails && (
          <form onSubmit={handleDetailLogSubmit} className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Difficulty rating */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-[#a1a1aa] uppercase">
                Difficulty Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDifficulty(star)}
                    className="p-1 rounded-lg transition-all"
                  >
                    <Star className={`w-4 h-4 ${
                      star <= difficulty 
                        ? 'fill-brand-success text-brand-success' 
                        : 'text-zinc-700'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Context Tags */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-[#a1a1aa] uppercase flex items-center gap-1">
                <Tag className="w-3 h-3 text-brand-success" />
                Context Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                        active
                          ? 'bg-brand-success/10 border-brand-success/40 text-brand-success font-black'
                          : 'bg-[#15151a] border-[#222226] text-[#a1a1aa] hover:border-[#3f3f46]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Log notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-[#a1a1aa] uppercase">
                Daily Log Notes
              </label>
              <input
                type="text"
                placeholder="e.g. felt great today, did this at the office"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#15151a] border border-[#222226] focus:border-brand-success/50 rounded-lg text-xs text-white placeholder-[#52525b] outline-none transition-all"
              />
            </div>

            {/* Submit Details */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a1a1aa] hover:bg-[#1a1a21] transition-all"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isLogging}
                className="px-3.5 py-1.5 rounded-lg bg-brand-success text-black text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                {isLogging && <Loader2 className="w-3 h-3 animate-spin text-black" />}
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
