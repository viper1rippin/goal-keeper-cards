
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
  onConfirmDelete: () => void;
}

export const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirmDelete 
}: DeleteConfirmationDialogProps) => (
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
          onClick={onConfirmDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
