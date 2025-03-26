
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
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

// Simplified schema - only title and description
const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
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
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Preserve the original timeline properties
    const updatedItem: SubGoalTimelineItem = {
      ...item,
      title: values.title,
      description: values.description || '',
    };
    
    onSave(updatedItem);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {item.id.startsWith('item-') ? 'New Timeline Item' : 'Edit Timeline Item'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Title</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter item title"
                    className="bg-slate-800 border-slate-700 text-white"
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
                    placeholder="Enter item description"
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onDelete(item.id)}
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                className="text-slate-400 hover:bg-slate-800/20 hover:text-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald hover:bg-emerald-dark"
              >
                {item.id.startsWith('item-') ? 'Create' : 'Update'} Item
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default SubGoalTimelineForm;
