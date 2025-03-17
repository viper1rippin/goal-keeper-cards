import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubGoalForm } from './subgoal/SubGoalForm';
import { useAuth } from "@/context/AuthContext";
import { SubGoal } from '@/types/goal-types';

// Form validation schema
const subGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

// Define the form values type explicitly - avoid using z.infer for nested components
interface FormValues {
  title: string;
  description: string;
}

// Interface for the data passed to onSave
export interface SubGoalData {
  id?: string;
  title: string;
  description: string;
}

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SubGoalData) => void;
  subGoalToEdit: SubGoal | null;
  parentGoalTitle: string;
  parentGoalId: string;
  onDelete?: (subGoalId: string) => Promise<void>;
}

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
  
  // Initialize form with proper explicit typing
  const form = useForm<FormValues>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different goal
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
      });
    }
  }, [isOpen, subGoalToEdit, form]);

  // Handle form submission
  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!user) return;
    
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

  const saveSubGoal = async (values: FormValues): Promise<void> => {
    if (!user) return;
    
    // Prepare sub-goal data
    const subGoalData = {
      parent_goal_id: parentGoalId,
      title: values.title,
      description: values.description,
      progress: subGoalToEdit?.progress || 0
    };
    
    // No need to verify parent goal ownership since user_id column doesn't exist
    
    // If editing, update the existing sub-goal
    if (subGoalToEdit && subGoalToEdit.id) {
      const { error } = await supabase
        .from('sub_goals')
        .update(subGoalData)
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
    } else {
      // Otherwise, create a new sub-goal
      const { error } = await supabase
        .from('sub_goals')
        .insert(subGoalData);
      
      if (error) throw error;
    }
    
    // Call the onSave callback to update UI with a simpler data structure
    onSave({
      id: subGoalToEdit?.id,
      title: values.title,
      description: values.description,
    });
  };

  // Handle delete sub-goal
  const handleDeleteSubGoal = async (): Promise<void> => {
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

  // Create a simple handler function for dialog open state changes
  const handleOpenChange = (open: boolean): void => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
