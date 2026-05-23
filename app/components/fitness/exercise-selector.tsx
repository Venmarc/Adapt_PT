'use client';

import React, { useState, useTransition } from 'react';
import { Search, X, Plus, Check, Loader2, Dumbbell } from 'lucide-react';
import { createCustomExercise } from '@/app/actions/fitness-actions';
import { toast } from '@/app/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string[] | null;
  is_custom: boolean;
}

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: { id: string; name: string; category: string }) => void;
  exercises: Exercise[];
  onCustomExerciseCreated: (newEx: Exercise) => void;
}

const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio'];

export default function ExerciseSelector({
  isOpen,
  onClose,
  onSelect,
  exercises,
  onCustomExerciseCreated,
}: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Custom exercise form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Push');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');
  
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || ex.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    startTransition(async () => {
      const muscles = customMuscleGroup
        ? customMuscleGroup.split(',').map((m) => m.trim()).filter(Boolean)
        : [];
        
      const res = await createCustomExercise(customName.trim(), customCategory, muscles);
      
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        toast.success(`Custom exercise "${res.data.name}" created!`);
        
        // Add to local state via parent callback
        const newEx: Exercise = {
          id: res.data.id,
          name: res.data.name,
          category: res.data.category,
          muscle_group: res.data.muscle_group,
          is_custom: res.data.is_custom,
        };
        onCustomExerciseCreated(newEx);
        
        // Auto-select and close form
        onSelect({ id: newEx.id, name: newEx.name, category: newEx.category });
        
        // Reset form
        setCustomName('');
        setCustomMuscleGroup('');
        setShowCustomForm(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-[#09090b] border-l border-[#27272a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-brand-success" />
              Select Exercise
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Choose an exercise or add a custom one</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-card-hover text-[#a1a1aa] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Exercise Form Toggle */}
        <div className="px-6 pt-4">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2.5 px-4 bg-[#18181b] border border-[#27272a] hover:border-brand-success/50 text-[#f4f4f5] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#202024]"
            >
              <Plus className="w-4 h-4 text-brand-success" />
              Create Custom Exercise
            </button>
          ) : (
            <form onSubmit={handleCreateCustom} className="p-4 bg-[#121214] border border-[#27272a] rounded-xl space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">New Custom Exercise</span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-xs text-[#a1a1aa] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs text-[#a1a1aa] mb-1">Exercise Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Kettlebell Flyes"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] focus:border-brand-success rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a1a1aa] mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] focus:border-brand-success rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#a1a1aa] mb-1">Muscles (comma-sep)</label>
                  <input
                    type="text"
                    placeholder="Chest, Shoulders"
                    value={customMuscleGroup}
                    onChange={(e) => setCustomMuscleGroup(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] focus:border-brand-success rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-brand-success text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-brand-success-hover transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Exercise'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Search & Categories */}
        <div className="p-6 pb-2 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#a1a1aa]" />
            <input
              type="text"
              placeholder="Search exercise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] focus:border-brand-success rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-success text-black font-bold'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:bg-card-hover hover:text-white border border-[#27272a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[#1e1e22]">
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-sm text-[#a1a1aa]">No exercises found</p>
              <p className="text-xs text-[#71717a] mt-1">Try creating a custom exercise above</p>
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect({ id: ex.id, name: ex.name, category: ex.category })}
                className="w-full py-3.5 text-left flex items-center justify-between hover:bg-[#18181b]/50 px-2 -mx-2 rounded-lg transition-colors group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-brand-success transition-colors">
                    {ex.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-success bg-brand-success/10 px-1.5 py-0.5 rounded">
                      {ex.category}
                    </span>
                    {ex.muscle_group && ex.muscle_group.length > 0 && (
                      <span className="text-[10px] text-[#71717a]">
                        {ex.muscle_group.join(', ')}
                      </span>
                    )}
                    {ex.is_custom && (
                      <span className="text-[10px] text-amber-500 border border-amber-500/20 px-1 py-0 rounded bg-amber-500/5">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#27272a] group-hover:border-brand-success flex items-center justify-center text-[#27272a] group-hover:text-brand-success transition-all bg-[#0f0f11]">
                  <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
