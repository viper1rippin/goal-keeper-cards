
import React, { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Goal } from '../GoalRow';
import { SubGoalFormValues } from '../SubGoalDialog';

interface SubGoalFormProps {
  form: UseFormReturn<SubGoalFormValues>;
  onSubmit: (values: SubGoalFormValues) => Promise<void>;
  onClose: () => void;
  subGoalToEdit: Goal | null;
}

export const SubGoalForm = ({ 
  form, 
  onSubmit, 
  onClose, 
  subGoalToEdit 
}: SubGoalFormProps) => {
  
  // Handle key press in the description field
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter is pressed (without Shift key to allow multiline text)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      form.handleSubmit(onSubmit)(); // Submit the form
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

        <div className="flex justify-end pt-4">
          <div className="flex gap-2">
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
