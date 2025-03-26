
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SubGoalTimelineItem } from './types';
import { useForm } from 'react-hook-form';

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem | null;
  roadmapId: string;
  onSave: (item: SubGoalTimelineItem) => void;
  onCancel: () => void;
  generateId: () => string;
  maxRows: number;
}

export const SubGoalTimelineForm = ({
  item,
  roadmapId,
  onSave,
  onCancel,
  generateId,
  maxRows,
}: SubGoalTimelineFormProps) => {
  const defaultValues = item || {
    id: generateId(),
    title: '',
    description: '',
    progress: 0,
    row: 0,
    start: 0,
    duration: 2,
  };
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues,
  });
  
  const progress = watch('progress');
  
  const onSubmit = (data: any) => {
    onSave(data as SubGoalTimelineItem);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Goal title"
          className="bg-slate-800 border-slate-700"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Goal description"
          className="bg-slate-800 border-slate-700 min-h-[80px]"
          {...register('description')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="progress">Progress: {progress}%</Label>
        <Slider
          id="progress"
          value={[progress]}
          min={0}
          max={100}
          step={5}
          onValueChange={(value) => setValue('progress', value[0])}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="row">Row (0-{maxRows - 1})</Label>
          <Input
            id="row"
            type="number"
            min={0}
            max={maxRows - 1}
            className="bg-slate-800 border-slate-700"
            {...register('row', {
              valueAsNumber: true,
              min: { value: 0, message: `Min value is 0` },
              max: { value: maxRows - 1, message: `Max value is ${maxRows - 1}` },
            })}
          />
          {errors.row && (
            <p className="text-xs text-red-500">{errors.row.message as string}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="start">Start Month (0-11)</Label>
          <Input
            id="start"
            type="number"
            min={0}
            max={11}
            className="bg-slate-800 border-slate-700"
            {...register('start', {
              valueAsNumber: true,
              min: { value: 0, message: 'Min value is 0' },
              max: { value: 11, message: 'Max value is 11' },
            })}
          />
          {errors.start && (
            <p className="text-xs text-red-500">{errors.start.message as string}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (months)</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={12}
          className="bg-slate-800 border-slate-700"
          {...register('duration', {
            valueAsNumber: true,
            min: { value: 1, message: 'Min duration is 1 month' },
            max: { value: 12, message: 'Max duration is 12 months' },
          })}
        />
        {errors.duration && (
          <p className="text-xs text-red-500">{errors.duration.message as string}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-emerald hover:bg-emerald-dark"
        >
          {item ? 'Update' : 'Create'} Goal
        </Button>
      </div>
    </form>
  );
};
