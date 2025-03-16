import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ParentGoalDialogContent } from "./parentgoal/ParentGoalDialogContent";
import { DeleteConfirmationDialog } from "./parentgoal/DeleteConfirmationDialog";
import { useIndexPage } from "./index/IndexPageContext";

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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleStopFocus } = useIndexPage();

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      if (goalToEdit?.id) {
        const { error } = await supabase
          .from('parent_goals')
          .update({
            title: values.title,
            description: values.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', goalToEdit.id);

        if (error) throw error;
        toast({ 
          title: "Goal updated",
          description: "Your goal has been updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('parent_goals')
          .insert([{
            title: values.title,
            description: values.description
          }]);

        if (error) throw error;
        toast({ 
          title: "Goal created",
          description: "Your new goal has been created successfully."
        });
      }
      
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

  const handleDelete = async (): Promise<void> => {
    if (!goalToEdit?.id) return;
    
    try {
      setIsDeleting(true);
      
      handleStopFocus();
      
      const { error: subGoalsError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', goalToEdit.id);
      
      if (subGoalsError) throw subGoalsError;
      
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', goalToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Goal deleted",
        description: "The goal and all its sub-goals have been successfully deleted."
      });
      
      setShowDeleteAlert(false);
      onClose();
      onGoalSaved();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ParentGoalDialogContent 
        isOpen={isOpen}
        onClose={onClose}
        goalToEdit={goalToEdit}
        onSubmit={handleSubmit}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <DeleteConfirmationDialog 
        open={showDeleteAlert} 
        onOpenChange={setShowDeleteAlert}
        onConfirmDelete={handleDelete}
      />
    </>
  );
};

export default ParentGoalDialog;
