
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ParentGoalForm from "./ParentGoalForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

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

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      if (goalToEdit?.id) {
        // Update existing goal
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
        // Create new goal
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
      // First delete all sub-goals associated with this parent goal
      const { error: subGoalsError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', goalToEdit.id);
      
      if (subGoalsError) throw subGoalsError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', goalToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Goal deleted",
        description: "The goal and all its sub-goals have been successfully deleted."
      });
      
      // Close dialogs and refresh goals
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
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-apple-dark border-slate-800/80 text-white max-w-md">
          <div className="flex justify-end">
            {goalToEdit && goalToEdit.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteAlert(true)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-transparent absolute top-6 right-12 z-10"
                aria-label="Delete goal"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <ParentGoalForm
            initialData={goalToEdit}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-apple-dark border-slate-800/80 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Goal</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will delete the goal and all its sub-goals. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-800/30 hover:bg-slate-800/20 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ParentGoalDialog;
