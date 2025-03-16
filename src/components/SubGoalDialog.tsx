import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Goal } from './GoalRow';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const subGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type SubGoalFormValues = z.infer<typeof subGoalSchema>;

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'progress'>) => void;
  subGoalToEdit: Goal | null;
  parentGoalTitle: string;
  parentGoalId: string;
}

const SubGoalDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subGoalToEdit,
  parentGoalTitle,
  parentGoalId
}: SubGoalDialogProps) => {
  const { toast } = useToast();
  
  // Initialize form with default values or editing values
  const form = useForm<SubGoalFormValues>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different goal
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
      });
    }
  }, [isOpen, subGoalToEdit, form]);

  // Handle form submission
  const onSubmit = async (values: SubGoalFormValues) => {
    try {
      // Prepare sub-goal data
      const subGoalData = {
        parent_goal_id: parentGoalId,
        title: values.title,
        description: values.description,
        progress: subGoalToEdit?.progress || 0
      };
      
      // If editing, update the existing sub-goal
      if (subGoalToEdit) {
        const { error } = await supabase
          .from('sub_goals')
          .update(subGoalData)
          .eq('id', subGoalToEdit.id);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal updated",
          description: "Your sub-goal has been updated successfully.",
        });
      } else {
        // Otherwise, create a new sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .insert(subGoalData);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal created",
          description: "Your sub-goal has been created successfully.",
        });
      }
      
      // Call the onSave callback to update UI
      onSave({
        title: values.title,
        description: values.description,
      });
      
      form.reset();
    } catch (error) {
      console.error("Error saving sub-goal:", error);
      toast({
        title: "Error saving sub-goal",
        description: "There was an error saving your sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {subGoalToEdit ? "Edit Sub-Goal" : "Add New Sub-Goal"}
          </DialogTitle>
          <p className="text-slate-400 mt-1">
            {parentGoalTitle ? `For parent goal: ${parentGoalTitle}` : ''}
          </p>
        </DialogHeader>

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald hover:bg-emerald-dark"
              >
                {subGoalToEdit ? "Update" : "Create"} Sub-Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SubGoalDialog;
