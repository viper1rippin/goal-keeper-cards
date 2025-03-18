
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ParentGoalDialogContent } from "./parentgoal/ParentGoalDialogContent";

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
  const { user } = useAuth(); // Get the current authenticated user

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      // If user is not authenticated, just use the callback
      if (!user) {
        // Update goal to edit with new values
        if (goalToEdit) {
          goalToEdit.title = values.title;
          goalToEdit.description = values.description;
        }
        
        // Close dialog and call the callback
        onClose();
        onGoalSaved();
        return;
      }

      // For authenticated users, use Supabase
      if (goalToEdit?.id) {
        // Update existing goal
        const { error } = await supabase
          .from('parent_goals')
          .update({
            title: values.title,
            description: values.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', goalToEdit.id)
          .eq('user_id', user.id); // Only update if user owns the goal

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
            user_id: user.id // Associate goal with user
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
    if (!goalToEdit?.id) return;
    
    try {
      // If user is not authenticated, just use the callback
      if (!user) {
        onClose();
        onGoalSaved();
        return;
      }

      // For authenticated users, use Supabase
      // First delete all sub-goals associated with this parent goal
      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', goalToEdit.id)
        .eq('user_id', user.id); // Only delete user's own sub-goals
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', goalToEdit.id)
        .eq('user_id', user.id); // Only delete user's own goal
      
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
