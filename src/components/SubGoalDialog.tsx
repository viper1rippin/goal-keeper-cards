
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubGoalForm, SubGoalFormData } from "./subgoal/SubGoalForm";
import { useAuth } from "@/context/AuthContext";

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentGoalId: string;
  subGoalToEdit?: {
    id: string;
    title: string;
    description: string;
    progress: number;
  } | null;
  onSubGoalSaved: () => void;
}

const SubGoalDialog = ({
  isOpen,
  onClose,
  parentGoalId,
  subGoalToEdit,
  onSubGoalSaved,
}: SubGoalDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async (formData: SubGoalFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save sub-goals.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (subGoalToEdit?.id) {
        // Update existing sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .update({
            title: formData.title,
            description: formData.description,
            progress: formData.progress || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', subGoalToEdit.id);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal updated",
          description: "Your sub-goal has been updated successfully."
        });
      } else {
        // Create new sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .insert([{
            title: formData.title,
            description: formData.description,
            progress: formData.progress || 0,
            parent_goal_id: parentGoalId
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal created",
          description: "Your new sub-goal has been created successfully."
        });
      }
      
      // Close dialog and refresh goals
      onClose();
      onSubGoalSaved();
    } catch (error) {
      console.error("Error saving sub-goal:", error);
      toast({
        title: "Error",
        description: "Failed to save the sub-goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !subGoalToEdit?.id) return;
    
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Sub-goal deleted",
        description: "Your sub-goal has been deleted successfully."
      });
      
      // Close dialog and refresh goals
      onClose();
      onSubGoalSaved();
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SubGoalForm
      isOpen={isOpen}
      onClose={onClose}
      subGoalToEdit={subGoalToEdit}
      onSubmit={handleSave}
      onDelete={subGoalToEdit ? handleDelete : undefined}
      isSubmitting={isSubmitting}
    />
  );
};

export default SubGoalDialog;
