'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { habitInputSchema } from '@/app/lib/validation';
import { HabitInput } from '@/app/actions/habit-actions';
import { X, Calendar, Info, Award, Loader2 } from 'lucide-react';

type HabitFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitInput) => Promise<void>;
  initialData?: any; // To support editing
  title: string;
};

const CATEGORIES = ['Health', 'Fitness', 'Mindfulness', 'Routine', 'Growth', 'Custom'];

const WEEKDAYS = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

export default function HabitForm({ isOpen, onClose, onSubmit, initialData, title }: HabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitInputSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Health',
      recurrence: {
        type: 'daily',
        days: [],
        every_x_days: 2,
      },
      target_count: 1,
      unit: 'times',
      is_active: true,
    },
  });

  // Watch type for conditional inputs
  const recurrenceType = watch('recurrence.type');
  const selectedDays = watch('recurrence.days') || [];

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          category: initialData.category,
          recurrence: {
            type: initialData.recurrence?.type || 'daily',
            days: initialData.recurrence?.days || [],
            every_x_days: initialData.recurrence?.every_x_days || 2,
          },
          target_count: initialData.target_count || 1,
          unit: initialData.unit || 'times',
          is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        });
      } else {
        reset({
          name: '',
          description: '',
          category: 'Health',
          recurrence: {
            type: 'daily',
            days: [],
            every_x_days: 2,
          },
          target_count: 1,
          unit: 'times',
          is_active: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: HabitInput) => {
    setIsSubmitting(true);
    try {
      // Clean config depending on recurrence type
      const recurrencePayload: any = { type: data.recurrence.type };
      if (data.recurrence.type === 'weekly') {
        recurrencePayload.days = data.recurrence.days;
      } else if (data.recurrence.type === 'interval') {
        recurrencePayload.every_x_days = Number(data.recurrence.every_x_days);
      }

      await onSubmit({
        ...data,
        recurrence: recurrencePayload,
        target_count: Number(data.target_count),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (dayValue: number) => {
    const currentDays = [...selectedDays];
    const index = currentDays.indexOf(dayValue);
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(dayValue);
    }
    setValue('recurrence.days', currentDays, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-success" />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:bg-[#1c1c21] hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Habit Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] tracking-wider uppercase flex items-center gap-1.5">
              Habit Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Meditation, Drink Water, Read Book"
              {...register('name')}
              className="w-full px-4 py-3 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-xl text-sm text-white placeholder-[#52525b] outline-none transition-all"
            />
            {errors.name && (
              <p className="text-xs text-[#ef4444] mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] tracking-wider uppercase">
              Description / Notes
            </label>
            <textarea
              placeholder="e.g. 10 minutes session in the morning before breakfast"
              rows={2}
              {...register('description')}
              className="w-full px-4 py-3 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-xl text-sm text-white placeholder-[#52525b] outline-none resize-none transition-all"
            />
          </div>

          {/* Category & Targets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] tracking-wider uppercase">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-xl text-sm text-white outline-none cursor-pointer transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Target & Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] tracking-wider uppercase">
                Target Per Day
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  {...register('target_count', { valueAsNumber: true })}
                  className="w-20 px-3 py-3 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-xl text-sm text-white outline-none text-center transition-all"
                />
                <input
                  type="text"
                  placeholder="times, ml, pages..."
                  {...register('unit')}
                  className="flex-1 px-4 py-3 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-xl text-sm text-white placeholder-[#52525b] outline-none transition-all"
                />
              </div>
              {(errors.target_count || errors.unit) && (
                <p className="text-xs text-[#ef4444] mt-1">
                  {errors.target_count?.message || errors.unit?.message}
                </p>
              )}
            </div>
          </div>

          {/* Recurrence Selection */}
          <div className="p-4 bg-[#121216] border border-[#1f1f23] rounded-xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-success" />
                Recurrence Rule
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'interval', label: 'Interval' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('recurrence.type', type.value as any)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      recurrenceType === type.value
                        ? 'bg-brand-success/10 border-brand-success/40 text-brand-success'
                        : 'bg-[#15151a] border-[#27272a] text-[#a1a1aa] hover:bg-[#1c1c21] hover:text-[#f4f4f5]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Weekday Pickers */}
            {recurrenceType === 'weekly' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-xs text-[#a1a1aa]">Run on these weekdays:</p>
                <div className="flex justify-between gap-1">
                  {WEEKDAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.label}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-success text-black border-brand-success font-black'
                            : 'bg-[#15151a] border-[#27272a] text-[#a1a1aa] hover:bg-[#1c1c21] hover:border-[#3f3f46]'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {errors.recurrence?.days && (
                  <p className="text-xs text-[#ef4444] mt-1">Please select at least one day.</p>
                )}
              </div>
            )}

            {/* Interval Configuration */}
            {recurrenceType === 'interval' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="text-xs text-[#a1a1aa]">Repeat every</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  {...register('recurrence.every_x_days')}
                  className="w-16 px-3 py-2 bg-[#15151a] border border-[#27272a] focus:border-brand-success/50 focus:ring-1 focus:ring-brand-success/30 rounded-lg text-sm text-white outline-none text-center transition-all"
                />
                <span className="text-xs text-[#a1a1aa]">days</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#1f1f23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#a1a1aa] hover:bg-[#1c1c21] hover:text-[#f4f4f5] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-success hover:bg-brand-success/90 text-[#030303] text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-success/15 hover:shadow-brand-success/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Habit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
