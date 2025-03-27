
import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { timelineItemFormSchema, TimelineItemFormValues } from './form/formSchema';
import FormHeader from './form/FormHeader';
import BasicInfoFields from './form/BasicInfoFields';
import DatePickerField from './form/DatePickerField';
import ProgressSliderField from './form/ProgressSliderField';
import FormButtons from './form/FormButtons';
import { calculateDuration, calculateStartPosition, calculateEndDateFromDurationChange } from './utils/timelineUtils';

interface TimelineItemFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const TimelineItemForm: React.FC<TimelineItemFormProps> = ({
  item,
  onSave,
  onDelete,
  onCancel,
  viewMode,
}) => {
  const form = useForm<TimelineItemFormValues>({
    resolver: zodResolver(timelineItemFormSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description || '',
      row: item.row,
      start: item.start,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      progress: item.progress,
      duration: item.duration,
    },
  });

  // Handle date changes affecting position
  useEffect(() => {
    const startDate = form.watch('startDate');
    const endDate = form.watch('endDate');
    
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      const start = calculateStartPosition(startDateObj, viewMode);
      form.setValue('start', start);
      
      const duration = calculateDuration(startDateObj, endDateObj, viewMode);
      form.setValue('duration', duration);
    }
  }, [form.watch('startDate'), form.watch('endDate'), viewMode, form]);

  // Handle duration changes affecting end date
  useEffect(() => {
    const startDate = form.watch('startDate');
    const duration = form.watch('duration');
    const currentEndDate = form.watch('endDate');
    
    if (startDate && duration && item.duration !== duration) {
      const startDateObj = new Date(startDate);
      const newEndDate = calculateEndDateFromDurationChange(
        startDateObj,
        item.duration,
        duration,
        viewMode
      );
      
      form.setValue('endDate', newEndDate.toISOString());
    }
  }, [form.watch('duration'), form, item.duration, viewMode]);

  const handleSubmit = (values: TimelineItemFormValues) => {
    const startDateObj = values.startDate ? new Date(values.startDate) : new Date();
    const endDateObj = values.endDate ? new Date(values.endDate) : new Date();
    
    const duration = values.duration || calculateDuration(startDateObj, endDateObj, viewMode);
    
    const updatedItem: SubGoalTimelineItem = {
      id: values.id,
      title: values.title,
      description: values.description || '',
      row: values.row,
      start: values.start,
      duration: duration,
      progress: values.progress,
      startDate: values.startDate,
      endDate: values.endDate,
      ...(item.parentId && { parentId: item.parentId }),
      ...(item.originalSubGoalId && { originalSubGoalId: item.originalSubGoalId }),
    };
    
    onSave(updatedItem);
  };

  const isNewItem = item.id.startsWith('item-');

  return (
    <>
      <FormHeader isNew={isNewItem} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <BasicInfoFields form={form} />

          <div className="grid grid-cols-2 gap-4">
            <DatePickerField 
              form={form} 
              name="startDate" 
              label="Start Date" 
            />
            <DatePickerField 
              form={form} 
              name="endDate" 
              label="End Date" 
            />
          </div>

          <ProgressSliderField form={form} />

          <FormButtons 
            onDelete={() => onDelete(item.id)} 
            onCancel={onCancel} 
          />
        </form>
      </Form>
    </>
  );
};

export default TimelineItemForm;
