
import React, { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { SubGoal } from '@/types/goal-types';
import { Trash2 } from "lucide-react";

// Match the form values with SubGoalDialog schema
interface FormValues {
  title: string;
  description: string;
}

interface SubGoalFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  onClose: () => void;
  subGoalToEdit: SubGoal | null;
  onDelete?: () => Promise<void>;
}

export const SubGoalForm = ({ 
  form, 
  onSubmit, 
  onClose, 
  subGoalToEdit,
  onDelete
}: SubGoalFormProps) => {
  
  // Handle key press in the description field
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter is pressed (without Shift key to allow multiline text)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      void form.handleSubmit(onSubmit)(); // Submit the form
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Title</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter sub-goal title"
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
                  placeholder="Enter sub-goal description"
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {/* Delete button shown only when editing existing sub-goals */}
          {subGoalToEdit && subGoalToEdit.id && onDelete && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onDelete}
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-800/20 hover:text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald hover:bg-emerald-dark"
            >
              {subGoalToEdit ? "Update" : "Create"} Sub-Goal
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
