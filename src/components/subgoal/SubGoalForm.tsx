
import React, { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Goal } from '../GoalRow';
import { SubGoalFormValues } from '../SubGoalDialog';
import { Trash2, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimelineCategory } from '../roadmap/types';

interface SubGoalFormProps {
  form: UseFormReturn<SubGoalFormValues>;
  onSubmit: (values: SubGoalFormValues) => Promise<void>;
  onClose: () => void;
  subGoalToEdit: Goal | null;
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
      form.handleSubmit(onSubmit)(); // Submit the form
    }
  };
  
  // Categories for timeline
  const categories: TimelineCategory[] = [
    "default",
    "research",
    "design",
    "development",
    "testing",
    "marketing",
    "feature",
    "milestone",
    "mobile",
    "web",
    "infrastructure",
    "backend"
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Color</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="color"
                    className="bg-slate-800 border-slate-700 text-white h-10 w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "default"}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Start Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      {...field} 
                      type="date"
                      className="bg-slate-800 border-slate-700 text-white pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">End Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      {...field} 
                      type="date"
                      className="bg-slate-800 border-slate-700 text-white pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
