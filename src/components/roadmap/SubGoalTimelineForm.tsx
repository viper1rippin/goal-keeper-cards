
import React from 'react';
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
import { SubGoalTimelineItem } from './types';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  row: z.number(),
  start: z.number(),
});

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = ({
  item,
  onSave,
  onDelete,
  onCancel,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description || '',
      row: item.row,
      start: item.start,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedItem: SubGoalTimelineItem = {
      ...item,
      id: values.id,
      title: values.title,
      description: values.description || '',
      row: values.row,
      start: values.start,
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
