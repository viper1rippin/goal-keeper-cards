
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
      // First set the isDeleting flag to true to disable UI
      setIsDeleting(true);
      
      // Stop focus first to prevent any state issues
      console.log("ParentGoalDialog: Stopping focus before deletion");
      handleStopFocus();
      
      // Delete all sub-goals first
      console.log("ParentGoalDialog: Deleting sub-goals for parent goal:", goalToEdit.id);
      const { error: subGoalsError, data: deletedSubGoals } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', goalToEdit.id)
        .select();
      
      if (subGoalsError) {
        console.error("Error deleting sub-goals:", subGoalsError);
        throw subGoalsError;
      }
      
      console.log(`ParentGoalDialog: Successfully deleted ${deletedSubGoals?.length || 0} sub-goals`);
      
      // Add a short delay to ensure sub-goals are fully deleted
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("ParentGoalDialog: Deleting parent goal:", goalToEdit.id);
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', goalToEdit.id);
      
      if (error) {
        console.error("Error deleting parent goal:", error);
        throw error;
      }
      
      console.log("ParentGoalDialog: Parent goal deleted successfully");
      
      toast({
        title: "Goal deleted",
        description: "The goal and all its sub-goals have been successfully deleted."
      });
      
      // First close the delete alert
      setShowDeleteAlert(false);
      // Then refresh the goals list and close the main dialog
      onGoalSaved(); // Refresh the goals list
      onClose();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always reset the isDeleting state, even on error
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ParentGoalDialogContent 
        isOpen={isOpen && !isDeleting}
        onClose={onClose}
        goalToEdit={goalToEdit}
        onSubmit={handleSubmit}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <DeleteConfirmationDialog 
        open={showDeleteAlert} 
        onOpenChange={setShowDeleteAlert}
        onConfirmDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ParentGoalDialog;
