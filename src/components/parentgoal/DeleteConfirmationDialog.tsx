
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
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirmDelete,
  isDeleting = false
}: DeleteConfirmationDialogProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    // Prevent any default actions
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log("ParentGoal DeleteConfirmationDialog: Starting delete operation");
      await onConfirmDelete();
      console.log("ParentGoal DeleteConfirmationDialog: Delete operation completed");
      // Let the parent component control dialog state
      // The parent is responsible for calling onOpenChange(false)
    } catch (error) {
      console.error("Error deleting goal:", error);
      // Ensure dialog closes even if there's an error
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={isDeleting ? undefined : onOpenChange}
    >
      <AlertDialogContent className="bg-apple-dark border-slate-800/80 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Goal</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This will delete the goal and all its sub-goals. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-slate-800/30 hover:bg-slate-800/20 text-white"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="confirm-delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
