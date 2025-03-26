
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubGoalTimelineItem, TimelineCategory, TimelineViewMode } from './types';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  category: z.string(),
  progress: z.number().min(0).max(100),
  duration: z.number().min(1).max(12),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  color: z.string().optional(),
});

type TimelineFormValues = z.infer<typeof formSchema>;

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete?: (itemId: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const timelineCategories: { value: TimelineCategory; label: string }[] = [
  { value: 'research', label: 'Research' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'feature', label: 'Feature' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'default', label: 'Default' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'web', label: 'Web' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'backend', label: 'Backend' },
];

const colorOptions = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-emerald-500', label: 'Emerald' },
];

const SubGoalTimelineForm = ({ item, onSave, onDelete, onCancel, viewMode }: SubGoalTimelineFormProps) => {
  const form = useForm<TimelineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item.title,
      description: item.description || '',
      category: item.category || 'default',
      progress: item.progress,
      duration: item.duration,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      color: item.color || '',
    },
  });

  function onSubmit(values: TimelineFormValues) {
    const updatedItem: SubGoalTimelineItem = {
      ...item,
      title: values.title,
      description: values.description || '',
      category: values.category as TimelineCategory,
      progress: values.progress,
      duration: values.duration,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      color: values.color || undefined,
    };
    
    onSave(updatedItem);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timelineCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`${color.value} w-4 h-4 rounded-full mr-2`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration: {field.value} {viewMode === 'month' ? 'weeks' : 'months'}</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormDescription>
                Duration in {viewMode === 'month' ? 'weeks' : 'months'}
              </FormDescription>
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-4">
          <div>
            {onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onDelete(item.id)}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SubGoalTimelineForm;
