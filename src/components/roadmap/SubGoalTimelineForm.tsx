
import React, { useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths, differenceInMonths, differenceInDays, differenceInQuarters, startOfMonth, startOfQuarter, addQuarters } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  row: z.number(),
  start: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(100),
});

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = ({
  item,
  onSave,
  onDelete,
  onCancel,
  viewMode,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description || '',
      row: item.row,
      start: item.start,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      progress: item.progress,
    },
  });

  // Calculate timeline positions when dates change
  useEffect(() => {
    const startDate = form.watch('startDate');
    const endDate = form.watch('endDate');
    
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Calculate timeline start position based on view mode
      const start = calculateStartPosition(startDateObj, viewMode);
      form.setValue('start', start);
      
      // Calculate duration based on view mode
      const duration = calculateDuration(startDateObj, endDateObj, viewMode);
      
      // We'll use this duration when saving the form
      form.setValue('duration', duration);
    }
  }, [form.watch('startDate'), form.watch('endDate'), viewMode]);

  // Calculate start position based on the date and view mode
  const calculateStartPosition = (date: Date, viewMode: TimelineViewMode): number => {
    if (viewMode === 'month') {
      // For month view, return the month index (0-11)
      return date.getMonth();
    } else if (viewMode === 'year') {
      // For year view, return the quarter index (0-3)
      return Math.floor(date.getMonth() / 3);
    }
    return 0;
  };

  // Calculate duration based on start and end dates and view mode
  const calculateDuration = (startDate: Date, endDate: Date, viewMode: TimelineViewMode): number => {
    if (viewMode === 'month') {
      // Calculate duration in months, minimum 1
      const monthsDiff = differenceInMonths(endDate, startDate);
      return Math.max(1, monthsDiff + 1); // +1 to include the start month
    } else if (viewMode === 'year') {
      // Calculate duration in quarters, minimum 1
      const quartersDiff = differenceInQuarters(endDate, startDate);
      return Math.max(1, quartersDiff + 1); // +1 to include the start quarter
    }
    return 1;
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const startDateObj = values.startDate ? new Date(values.startDate) : new Date();
    const endDateObj = values.endDate ? new Date(values.endDate) : addMonths(startDateObj, 1);
    
    // Calculate duration for saving
    const duration = calculateDuration(startDateObj, endDateObj, viewMode);
    
    const updatedItem: SubGoalTimelineItem = {
      id: values.id,
      title: values.title,
      description: values.description || '',
      row: values.row,
      start: values.start,
      duration: duration, // Use calculated duration
      progress: values.progress,
      startDate: values.startDate,
      endDate: values.endDate,
      ...(item.parentId && { parentId: item.parentId }),
      ...(item.originalSubGoalId && { originalSubGoalId: item.originalSubGoalId }),
      ...(item.category && { category: item.category })
    };
    
    onSave(updatedItem);
  };

  const getTimeUnitLabel = () => {
    switch (viewMode) {
      case 'month':
        return 'months';
      case 'year':
        return 'quarters';
      default:
        return 'months';
    }
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
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
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
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
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
