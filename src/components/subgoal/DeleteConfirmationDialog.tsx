
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
      console.error("Error deleting sub-goal:", error);
      // Ensure dialog closes even if there's an error
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Sub-Goal</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This action cannot be undone. This will permanently delete the sub-goal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
