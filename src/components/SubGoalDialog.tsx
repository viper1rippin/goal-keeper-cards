
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Goal } from './GoalRow';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubGoalForm } from './subgoal/SubGoalForm';
import { useAuth } from "@/context/AuthContext";
import { TimelineCategory } from './roadmap/types';

// Form validation schema
const subGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type SubGoalFormValues = z.infer<typeof subGoalSchema>;

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'progress'>) => void;
  subGoalToEdit: Goal | null;
  parentGoalTitle: string;
  parentGoalId: string;
  onDelete?: (subGoalId: string) => Promise<void>;
}

// Main component
const SubGoalDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subGoalToEdit,
  parentGoalTitle,
  parentGoalId,
  onDelete
}: SubGoalDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the current authenticated user
  
  // Initialize form with default values or editing values
  const form = useForm<SubGoalFormValues>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
      startDate: subGoalToEdit?.startDate || "",
      endDate: subGoalToEdit?.endDate || "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different goal
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
        startDate: subGoalToEdit?.startDate || "",
        endDate: subGoalToEdit?.endDate || "",
      });
    }
  }, [isOpen, subGoalToEdit, form]);

  // Handle form submission
  const onSubmit = async (values: SubGoalFormValues) => {
    try {
      // Check if user is authenticated
      if (!user) {
        // For guest mode, just call onSave with the form values
        const newSubGoal = {
          id: subGoalToEdit?.id || `temp-${Date.now()}`,
          title: values.title,
          description: values.description,
          progress: subGoalToEdit?.progress || 0,
          startDate: values.startDate,
          endDate: values.endDate,
        };
        
        onSave(newSubGoal);
        
        form.reset();
        onClose();
        return;
      }

      await saveSubGoal(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error saving sub-goal:", error);
      toast({
        title: "Error saving sub-goal",
        description: "There was an error saving your sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveSubGoal = async (values: SubGoalFormValues) => {
    // Check if user is authenticated
    if (!user) return;

    // Generate default category based on title (simple heuristic)
    const defaultCategory: TimelineCategory = determineDefaultCategory(values.title);

    // Calculate timeline position data
    const timelineRow = subGoalToEdit?.timeline_row || 0;
    const timelineStart = subGoalToEdit?.timeline_start || 0;
    const timelineDuration = subGoalToEdit?.timeline_duration || 2;
    const timelineCategory = subGoalToEdit?.timeline_category || defaultCategory;

    // Prepare sub-goal data
    const subGoalData = {
      parent_goal_id: parentGoalId,
      title: values.title,
      description: values.description,
      progress: subGoalToEdit?.progress || 0,
      user_id: user.id, // Associate sub-goal with user
      start_date: values.startDate || null,
      end_date: values.endDate || null,
      timeline_row: timelineRow,
      timeline_start: timelineStart,
      timeline_duration: timelineDuration,
      timeline_category: timelineCategory
    };
    
    // If editing, update the existing sub-goal
    if (subGoalToEdit && subGoalToEdit.id) {
      const { error } = await supabase
        .from('sub_goals')
        .update(subGoalData)
        .eq('id', subGoalToEdit.id)
        .eq('user_id', user.id); // Only update if user owns the sub-goal
      
      if (error) throw error;
    } else {
      // Otherwise, create a new sub-goal
      const { error } = await supabase
        .from('sub_goals')
        .insert(subGoalData);
      
      if (error) throw error;
    }
    
    // Call the onSave callback to update UI
    onSave({
      title: values.title,
      description: values.description,
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  // Simple function to determine default category based on title
  const determineDefaultCategory = (title: string): TimelineCategory => {
    const lowercaseTitle = title.toLowerCase();
    
    if (lowercaseTitle.includes('research') || lowercaseTitle.includes('study')) return 'research';
    if (lowercaseTitle.includes('design') || lowercaseTitle.includes('ui') || lowercaseTitle.includes('ux')) return 'design';
    if (lowercaseTitle.includes('develop') || lowercaseTitle.includes('code') || lowercaseTitle.includes('implement')) return 'development';
    if (lowercaseTitle.includes('test') || lowercaseTitle.includes('qa')) return 'testing';
    if (lowercaseTitle.includes('release') || lowercaseTitle.includes('launch') || lowercaseTitle.includes('v')) return 'milestone';
    if (lowercaseTitle.includes('mobile') || lowercaseTitle.includes('ios') || lowercaseTitle.includes('android')) return 'mobile';
    if (lowercaseTitle.includes('web') || lowercaseTitle.includes('browser')) return 'web';
    if (lowercaseTitle.includes('server') || lowercaseTitle.includes('database') || lowercaseTitle.includes('api')) return 'backend';
    
    return 'default';
  };

  // Handle delete sub-goal
  const handleDeleteSubGoal = async () => {
    if (subGoalToEdit?.id && onDelete) {
      try {
        await onDelete(subGoalToEdit.id);
        onClose(); // Close the dialog after deletion
      } catch (error) {
        console.error("Error deleting sub-goal:", error);
        toast({
          title: "Error deleting sub-goal",
          description: "There was an error deleting your sub-goal. Please try again.",
          variant: "destructive",
        });
      }
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

        <SubGoalForm 
          form={form} 
          onSubmit={onSubmit} 
          subGoalToEdit={subGoalToEdit}
          onClose={onClose}
          onDelete={subGoalToEdit?.id && onDelete ? handleDeleteSubGoal : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubGoalDialog;
