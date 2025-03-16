
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
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
      console.log("DeleteConfirmationDialog: Starting delete operation");
      await onConfirmDelete();
      console.log("DeleteConfirmationDialog: Delete operation completed");
      // Let the parent component control dialog state
      // The parent is responsible for calling onOpenChange(false)
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      // Ensure dialog closes even if there's an error
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={isDeleting ? undefined : onOpenChange}
    >
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Sub-Goal</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This action cannot be undone. This will permanently delete the sub-goal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
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
