'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Smile, Sun, BedDouble, Calendar, Sparkles, Trash2, 
  BookOpen, Quote, ChevronRight, Star, Moon, AlertCircle
} from 'lucide-react';
import { toast } from '@/app/hooks/use-toast';
import { upsertWellnessEntry, deleteWellnessEntry } from '@/app/actions/wellness-actions';

// Interfaces matches database schemas
interface WellnessEntry {
  id: string;
  entry_date: string;
  mood: number;
  energy: number;
  sleep_hours: number;
  sleep_quality: number;
  notes: string | null;
  created_at: string;
}

interface WellnessClientProps {
  initialEntries: WellnessEntry[];
}

const JOURNAL_PROMPTS = [
  { id: 'highlight', label: '💡 Today\'s Highlight', placeholder: 'What was the best part of your day, and why?' },
  { id: 'grateful', label: '🙏 Gratitude Practice', placeholder: 'Name 3 things you are grateful for today.' },
  { id: 'challenges', label: '🔋 Energy & Hurdles', placeholder: 'What felt challenging or mentally draining today? How did you respond?' },
  { id: 'reflection', label: '🧘 Self Reflection', placeholder: 'What is one thing you learned about yourself today?' },
  { id: 'free', label: '📝 Free Writing', placeholder: 'Write anything that is on your mind...' }
];

const MOODS = [
  { value: 1, emoji: '😠', label: 'Awful', color: 'hover:bg-red-500/10 text-red-400 border-red-500/20 bg-red-950/5' },
  { value: 2, emoji: '😕', label: 'Bad', color: 'hover:bg-orange-500/10 text-orange-400 border-orange-500/20 bg-orange-950/5' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'hover:bg-amber-500/10 text-amber-400 border-amber-500/20 bg-amber-950/5' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 bg-emerald-950/5' },
  { value: 5, emoji: '😄', label: 'Excellent', color: 'hover:bg-brand-success/15 text-brand-success border-brand-success/20 bg-brand-success/5' }
];

const ENERGIES = [
  { value: 1, label: '⚡ Low', desc: 'Exhausted' },
  { value: 2, label: '⚡ Mod-Low', desc: 'Sluggish' },
  { value: 3, label: '⚡ Balanced', desc: 'Steady' },
  { value: 4, label: '⚡ Active', desc: 'Productive' },
  { value: 5, label: '⚡ High', desc: 'Supercharged' }
];

export default function WellnessClient({ initialEntries }: WellnessClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [entries, setEntries] = useState<WellnessEntry[]>(initialEntries);

  // Form states
  const [entryDate, setEntryDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Journal prompt selection
  const [activePromptIndex, setActivePromptIndex] = useState<number>(4); // Default to Free Writing
  const currentPrompt = JOURNAL_PROMPTS[activePromptIndex];

  // Auto-populate when the entryDate or initialEntries list changes
  useEffect(() => {
    const existing = entries.find(e => e.entry_date === entryDate);
    if (existing) {
      setMood(existing.mood);
      setEnergy(existing.energy);
      setSleepHours(Number(existing.sleep_hours));
      setSleepQuality(existing.sleep_quality);
      setNotes(existing.notes || '');
      setIsEditing(true);
    } else {
      setMood(3);
      setEnergy(3);
      setSleepHours(7.5);
      setSleepQuality(3);
      setNotes('');
      setIsEditing(false);
    }
  }, [entryDate, entries]);

  // Aggregated Stats
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { avgSleep: 0, avgMood: 0, avgEnergy: 0 };
    }
    const totalSleep = entries.reduce((acc, curr) => acc + Number(curr.sleep_hours), 0);
    const totalMood = entries.reduce((acc, curr) => acc + curr.mood, 0);
    const totalEnergy = entries.reduce((acc, curr) => acc + curr.energy, 0);
    return {
      avgSleep: Math.round((totalSleep / entries.length) * 10) / 10,
      avgMood: Math.round((totalMood / entries.length) * 10) / 10,
      avgEnergy: Math.round((totalEnergy / entries.length) * 10) / 10,
    };
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await upsertWellnessEntry({
        entry_date: entryDate,
        mood,
        energy,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        notes: notes.trim() || null,
      });

      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        toast.success(isEditing ? 'Wellness log updated!' : 'Daily wellness logged!');
        
        // Refresh local entry list
        setEntries(prev => {
          const index = prev.findIndex(item => item.entry_date === entryDate);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = res.data as WellnessEntry;
            return updated;
          } else {
            return [res.data as WellnessEntry, ...prev].sort(
              (a, b) => b.entry_date.localeCompare(a.entry_date)
            );
          }
        });
        
        // Push tab to history if it was a new creation to review it
        if (!isEditing) {
          setActiveTab('history');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, dateStr: string) => {
    if (!confirm(`Are you sure you want to delete the wellness log for ${dateStr}?`)) {
      return;
    }

    try {
      const res = await deleteWellnessEntry(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Wellness log removed.');
        setEntries(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred deleting the log.');
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6 bg-black text-[#f4f4f5] pb-24">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-16 md:mt-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500/20" />
            Wellness Tracker
          </h1>
          <p className="text-xs text-[#a1a1aa] font-medium">
            Monitor daily sleep, mood, energy levels, and mental reflections.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-[#121214] border border-[#27272a] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'log'
                ? 'bg-[#1e1e22] text-white'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#1e1e22] text-white'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            History & Stats
          </button>
        </div>
      </div>

      {/* Main pane content */}
      {activeTab === 'log' ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main logging panel */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 md:p-6 space-y-6">
              
              {/* Step 1: Mood */}
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  1. How is your mood today?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => {
                    const isSelected = mood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(m.value)}
                        className={`flex flex-col items-center justify-center py-3.5 px-1 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-brand-success bg-brand-success/10 text-white scale-[1.03] shadow-md shadow-brand-success/5'
                            : 'border-[#27272a] bg-[#121214]/40 text-[#a1a1aa] ' + m.color
                        }`}
                      >
                        <span className="text-2xl mb-1">{m.emoji}</span>
                        <span className="text-[10px] font-bold tracking-wide">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Energy */}
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  2. Energy Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ENERGIES.map((e) => {
                    const isSelected = energy === e.value;
                    return (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => setEnergy(e.value)}
                        className={`flex flex-col items-center py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10 text-white scale-[1.02]'
                            : 'border-[#27272a] bg-[#121214]/40 text-[#a1a1aa] hover:border-amber-500/20 hover:text-amber-400'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{e.label}</span>
                        <span className="text-[9px] text-[#71717a] mt-0.5">{e.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Sleep */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1 border-t border-[#1a1a1c]">
                
                {/* Sleep duration counter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-blue-400" />
                    Sleep Hours
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSleepHours(prev => Math.max(0, prev - 0.5))}
                      className="w-10 h-10 rounded-xl bg-[#121214] border border-[#27272a] text-white hover:bg-[#18181b] font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 bg-[#121214] border border-[#27272a] rounded-xl h-10 flex items-center justify-center">
                      <span className="text-sm font-extrabold text-white">{sleepHours.toFixed(1)} hrs</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSleepHours(prev => Math.min(24, prev + 0.5))}
                      className="w-10 h-10 rounded-xl bg-[#121214] border border-[#27272a] text-white hover:bg-[#18181b] font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sleep Quality star rating */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-purple-400" />
                    Sleep Quality
                  </label>
                  <div className="flex items-center h-10 gap-2 px-3 bg-[#121214] border border-[#27272a] rounded-xl justify-around">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isActive = sleepQuality >= val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSleepQuality(val)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              isActive 
                                ? 'text-purple-400 fill-purple-400/30' 
                                : 'text-[#27272a] fill-none'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Step 4: Daily Journal Prompts */}
              <div className="space-y-3 border-t border-[#1a1a1c] pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-pink-400" />
                    Daily Reflection
                  </label>
                  
                  {/* Rotating prompt pills */}
                  <div className="flex flex-wrap gap-1">
                    {JOURNAL_PROMPTS.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePromptIndex(idx)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${
                          activePromptIndex === idx
                            ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                            : 'bg-transparent text-[#71717a] border-transparent hover:text-[#a1a1aa]'
                        }`}
                      >
                        {p.label.split(' ')[0]} {/* Emoji only */}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 bg-[#121214]/60 border border-[#1e1e22] rounded-xl p-3.5 relative">
                  <div className="flex gap-2 items-start mb-1 text-[11px] font-semibold text-[#a1a1aa]">
                    <Quote className="w-3.5 h-3.5 text-pink-500/60 shrink-0 mt-0.5" />
                    <span>{currentPrompt.label}</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={currentPrompt.placeholder}
                    rows={4}
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#e4e4e7] placeholder-[#52525b] resize-none focus:ring-0 focus:ring-offset-0 p-0"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar configuration & actions */}
          <div className="space-y-6">
            
            {/* Date and Submit controls */}
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-1.5 pb-2 border-b border-[#27272a]">
                <Calendar className="w-4 h-4 text-blue-400" />
                Logging Config
              </h3>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#a1a1aa] uppercase">Target Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Edit vs Insert indicator info */}
              <div className="bg-[#121214] border border-[#1e1e22] rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <div className="text-[10px] text-[#a1a1aa] leading-relaxed">
                  {isEditing ? (
                    <span className="font-semibold text-white">
                      An entry already exists for this date. Saving will overwrite the record.
                    </span>
                  ) : (
                    <span>No entry recorded for this date. Save to write a new daily wellness log.</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-brand-success hover:bg-brand-success-hover disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-brand-success/10"
              >
                {isSubmitting ? 'Saving log...' : isEditing ? 'Update Daily Log' : 'Save Daily Log'}
              </button>
            </div>

            {/* Quick tips panel */}
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Wellness Guide
              </h3>
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                Aim for 7 to 9 hours of sleep daily. Consistently tracking mood and sleep allows Momentum's correlation engine to map matches in your performance later.
              </p>
            </div>

          </div>

        </form>
      ) : (
        /* History & stats view */
        <div className="space-y-8">
          
          {/* Overview telemetry stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4.5 space-y-2">
              <div className="flex justify-between items-center text-[#a1a1aa]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Sleep Duration</span>
                <Moon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                {stats.avgSleep} <span className="text-xs font-medium text-[#71717a]">hrs</span>
              </div>
              <p className="text-[9px] text-[#71717a]">Average recorded rest hours</p>
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4.5 space-y-2">
              <div className="flex justify-between items-center text-[#a1a1aa]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Mood Rating</span>
                <Smile className="w-4 h-4 text-brand-success" />
              </div>
              <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                {stats.avgMood} <span className="text-xs font-medium text-[#71717a]">/ 5</span>
              </div>
              <p className="text-[9px] text-[#71717a]">Overall happiness score</p>
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4.5 space-y-2">
              <div className="flex justify-between items-center text-[#a1a1aa]">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Energy Score</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                {stats.avgEnergy} <span className="text-xs font-medium text-[#71717a]">/ 5</span>
              </div>
              <p className="text-[9px] text-[#71717a]">Daily productivity indicator</p>
            </div>
          </div>

          {/* Historical timeline listing */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-[#27272a] pb-2">
              History Logs ({entries.length})
            </h2>

            {entries.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#27272a] rounded-2xl">
                <p className="text-xs text-[#a1a1aa]">No logs available in the last 30 days.</p>
                <button
                  onClick={() => setActiveTab('log')}
                  className="mt-3 px-3 py-1.5 bg-[#121214] border border-[#27272a] text-white hover:text-brand-success text-[10px] font-bold rounded-lg transition-colors"
                >
                  Create First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => {
                  const entryMoodObj = MOODS.find(m => m.value === entry.mood);
                  const entryEnergyObj = ENERGIES.find(e => e.value === entry.energy);
                  
                  return (
                    <div 
                      key={entry.id} 
                      className="bg-[#09090b] border border-[#27272a] hover:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-2.5 flex-1">
                        
                        {/* Header details */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-white bg-[#121214] border border-[#27272a] px-2.5 py-1 rounded-lg">
                            {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>

                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              {entryMoodObj?.emoji || '😐'} {entryMoodObj?.label || 'Okay'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                              ⚡ {entry.energy}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
                              🌙 {Number(entry.sleep_hours).toFixed(1)}h (Quality: {entry.sleep_quality}★)
                            </span>
                          </div>
                        </div>

                        {/* Notes details */}
                        {entry.notes && (
                          <div className="bg-[#121214]/60 border border-[#1e1e22] rounded-xl p-3 flex gap-2">
                            <Quote className="w-3.5 h-3.5 text-pink-500/40 shrink-0 mt-0.5" />
                            <p className="text-xs text-[#a1a1aa] leading-relaxed italic">{entry.notes}</p>
                          </div>
                        )}

                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center border-t border-[#1e1e22] pt-3.5 md:pt-0 md:border-0 w-full md:w-auto justify-end">
                        <button
                          onClick={() => {
                            setEntryDate(entry.entry_date);
                            setActiveTab('log');
                          }}
                          className="px-3 py-1.5 border border-[#27272a] hover:border-zinc-700 hover:bg-[#121214] text-[#a1a1aa] hover:text-white rounded-xl text-[10px] font-bold transition-all"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(entry.id, entry.entry_date)}
                          className="p-1.5 border border-[#27272a] hover:border-red-500/20 bg-transparent text-[#71717a] hover:text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
