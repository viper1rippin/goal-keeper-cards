
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ParentGoalForm from "./ParentGoalForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  // Handle delete functionality
  const handleDelete = async () => {
    try {
      if (goalToEdit?.id) {
        // First delete all sub-goals connected to this parent goal
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
          description: "Your goal and all its sub-goals have been deleted successfully.",
        });

        // Close both dialogs
        setIsDeleteDialogOpen(false);
        onClose();
        onGoalSaved();
      }
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {goalToEdit ? "Edit Goal" : "Create New Goal"}
            </h3>
            {goalToEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-slate-800/50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this goal and all of its sub-goals. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
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
