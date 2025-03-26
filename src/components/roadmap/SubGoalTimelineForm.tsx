
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SubGoalTimelineItem } from './types';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';

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
    category: 'feature'
  };
  
  const form = useForm({
    defaultValues,
  });
  
  const progress = form.watch('progress');
  const category = form.watch('category');
  
  const onSubmit = (data: any) => {
    onSave(data as SubGoalTimelineItem);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Goal title"
                  className="bg-slate-800 border-slate-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Goal description"
                  className="bg-slate-800 border-slate-700 min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Progress: {field.value}%</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="pt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="row"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Row (0-{maxRows - 1})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={maxRows - 1}
                    className="bg-slate-800 border-slate-700"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Start (0-11)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    className="bg-slate-800 border-slate-700"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Duration (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    className="bg-slate-800 border-slate-700"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
    </Form>
  );
};
