import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  row: z.number(),
  start: z.number(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  progress: z.number().min(0).max(100),
  color: z.string().optional(),
});

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

// Predefined colors that match our previous category colors
const cardColors = [
  { value: 'amber', label: 'Amber', class: 'from-amber-500 to-amber-600 border-amber-400' },
  { value: 'blue', label: 'Blue', class: 'from-blue-400 to-blue-500 border-blue-300' },
  { value: 'purple', label: 'Purple', class: 'from-purple-400 to-purple-500 border-purple-300' },
  { value: 'pink', label: 'Pink', class: 'from-pink-400 to-pink-500 border-pink-300' },
  { value: 'emerald', label: 'Emerald', class: 'from-emerald-400 to-emerald-500 border-emerald-300' },
  { value: 'orange', label: 'Orange', class: 'from-orange-400 to-orange-500 border-orange-300' },
  { value: 'red', label: 'Red', class: 'from-red-400 to-red-500 border-red-300' },
];

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = ({
  item,
  onSave,
  onDelete,
  onCancel,
  viewMode,
}) => {
  // Parse dates if they exist
  const startDate = item.startDate ? new Date(item.startDate) : undefined;
  const endDate = item.endDate ? new Date(item.endDate) : undefined;

  // Set a default color if not provided
  const defaultColor = item.color || cardColors[Math.floor(Math.random() * cardColors.length)].value;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description || '',
      row: item.row,
      start: item.start,
      startDate: startDate,
      endDate: endDate,
      progress: item.progress,
      color: defaultColor,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedItem: SubGoalTimelineItem = {
      id: values.id,
      title: values.title,
      description: values.description || '',
      row: values.row,
      start: values.start,
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      endDate: values.endDate ? values.endDate.toISOString() : undefined,
      progress: values.progress,
      color: values.color,
      ...(item.parentId && { parentId: item.parentId }),
      ...(item.originalSubGoalId && { originalSubGoalId: item.originalSubGoalId })
    };
    
    onSave(updatedItem);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {item.id.startsWith('item-') ? 'Add New Item' : 'Edit Item'}
        </DialogTitle>
        <DialogDescription>
          Modify the details of this timeline item
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description (optional)"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Color</FormLabel>
                <div className="grid grid-cols-7 gap-2">
                  {cardColors.map(colorOption => (
                    <Button
                      key={colorOption.value}
                      type="button"
                      onClick={() => field.onChange(colorOption.value)}
                      className={cn(
                        "h-8 w-8 rounded-full p-0 flex items-center justify-center bg-gradient-to-r",
                        colorOption.class,
                        field.value === colorOption.value ? "ring-2 ring-offset-2 ring-slate-400" : ""
                      )}
                      title={colorOption.label}
                    >
                      {field.value === colorOption.value && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress: {field.value}%</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default SubGoalTimelineForm;
