
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Goal } from './GoalRow';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from './subgoal/DeleteConfirmationDialog';
import { SubGoalForm } from './subgoal/SubGoalForm';
import { useIndexPage } from './index/IndexPageContext';

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
  const { handleStopFocus, fetchParentGoals } = useIndexPage();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<SubGoalFormValues>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
      });
    }
  }, [isOpen, subGoalToEdit, form]);

  const onSubmit = async (values: SubGoalFormValues) => {
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
    const subGoalData = {
      parent_goal_id: parentGoalId,
      title: values.title,
      description: values.description,
      progress: subGoalToEdit?.progress || 0
    };
    
    if (subGoalToEdit && subGoalToEdit.id) {
      const { error } = await supabase
        .from('sub_goals')
        .update(subGoalData)
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('sub_goals')
        .insert(subGoalData);
      
      if (error) throw error;
    }
    
    onSave({
      title: values.title,
      description: values.description,
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!subGoalToEdit || !subGoalToEdit.id) return;
    
    try {
      // First set the isDeleting flag to true to disable UI
      setIsDeleting(true);
      
      // Stop focus first to prevent any state issues
      console.log("SubGoalDialog: Stopping focus before deletion");
      handleStopFocus();
      
      console.log("SubGoalDialog: Deleting sub-goal:", subGoalToEdit.id);
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', subGoalToEdit.id);
      
      if (error) {
        console.error("Error deleting sub-goal:", error);
        throw error;
      }
      
      console.log("SubGoalDialog: Sub-goal deleted successfully");
      
      toast({
        title: "Sub-goal deleted",
        description: "The sub-goal has been successfully deleted.",
      });
      
      // Close the delete confirmation dialog first
      setShowDeleteAlert(false);
      
      // Refresh state to ensure UI consistency
      await fetchParentGoals();
      
      // Then trigger parent update and close the main dialog
      onSave({ title: "", description: "" }); // Trigger parent component update
      onClose();
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      toast({
        title: "Error deleting sub-goal",
        description: "There was an error deleting your sub-goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always reset the isDeleting state, even on error
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
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
            onDelete={() => setShowDeleteAlert(true)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog 
        open={showDeleteAlert} 
        onOpenChange={setShowDeleteAlert} 
        onConfirmDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SubGoalDialog;
