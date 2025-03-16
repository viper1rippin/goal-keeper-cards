
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ParentGoalDialogContent } from "./parentgoal/ParentGoalDialogContent";
import { useAuth } from "@/contexts/AuthContext";

interface ParentGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: { id: string; title: string; description: string } | null;
  onGoalSaved: () => void;
}

const ParentGoalDialog = ({
  isOpen,
  onClose,
  goalToEdit,
  onGoalSaved
}: ParentGoalDialogProps) => {
  const { user } = useAuth();
  
  const handleSubmit = async (values: { title: string; description: string }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save goals.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const now = new Date().toISOString();
      
      if (goalToEdit?.id) {
        // Update existing goal
        const { error } = await supabase
          .from('parent_goals')
          .update({
            title: values.title,
            description: values.description,
            updated_at: now
          })
          .eq('id', goalToEdit.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ 
          title: "Goal updated",
          description: "Your goal has been updated successfully."
        });
      } else {
        // Create new goal
        const { error } = await supabase
          .from('parent_goals')
          .insert([{
            title: values.title,
            description: values.description,
            user_id: user.id,
            created_at: now,
            updated_at: now
          }]);

        if (error) throw error;
        toast({ 
          title: "Goal created",
          description: "Your new goal has been created successfully."
        });
      }
      
      // Close dialog and refresh goals
      onClose();
      onGoalSaved();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save the goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!user || !goalToEdit?.id) return;
    
    try {
      // First delete all sub-goals associated with this parent goal
      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', goalToEdit.id)
        .eq('user_id', user.id);
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', goalToEdit.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Goal Deleted",
        description: "The goal and all its sub-goals have been deleted.",
      });
      
      // Close dialog and refresh goals
      onClose();
      onGoalSaved();
    } catch (error) {
      console.error("Error deleting parent goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ParentGoalDialogContent 
      isOpen={isOpen}
      onClose={onClose}
      goalToEdit={goalToEdit}
      onSubmit={handleSubmit}
      onDelete={goalToEdit ? handleDelete : undefined}
    />
  );
};

export default ParentGoalDialog;
