
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
} from "@/components/ui/alert-dialog";

interface DeleteSubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

// Remove React.FC to prevent deep type instantiation
const DeleteSubGoalDialog = ({ isOpen, onClose, onConfirm }: DeleteSubGoalDialogProps) => {
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Sub-Goal</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this sub-goal? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => { 
              void onConfirm(); // Properly handle the promise
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSubGoalDialog;
