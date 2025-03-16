
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirmDelete: () => Promise<void>;
}

export const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirmDelete 
}: DeleteConfirmationDialogProps) => {
  const handleDelete = async () => {
    try {
      await onConfirmDelete();
      // Dialog will close automatically from parent component
    } catch (error) {
      console.error("Error deleting goal:", error);
      // Ensure dialog closes even if there's an error
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            data-testid="confirm-delete-button"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
