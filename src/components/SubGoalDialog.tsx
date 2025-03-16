import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubGoalForm } from './subgoal/SubGoalForm';
import { useAuth } from "@/contexts/AuthContext";
import { Goal } from './index/IndexPageTypes';

// Form validation schema
const subGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
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
  const { user } = useAuth();
  
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save sub-goals.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveSubGoal(values);
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

  const saveSubGoal = async (values: SubGoalFormValues) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    
    // Prepare sub-goal data
    const subGoalData = {
      parent_goal_id: parentGoalId,
      title: values.title,
      description: values.description,
      progress: subGoalToEdit?.progress || 0,
      created_at: now,
      updated_at: now,
      position: 0,  // Default position
      completed: false // Default completed status
    };
    
    // If editing, update the existing sub-goal
    if (subGoalToEdit && subGoalToEdit.id) {
      const { error } = await supabase
        .from('sub_goals')
        .update({
          title: values.title,
          description: values.description,
          updated_at: now
        })
        .eq('id', subGoalToEdit.id);
      
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
    });
  };

  // Handle delete sub-goal
  const handleDeleteSubGoal = async () => {
    if (!user || !subGoalToEdit?.id || !onDelete) return;
    
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
