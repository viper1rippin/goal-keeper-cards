
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";
import DeleteParentGoalDialog from "./DeleteParentGoalDialog";
import { useState } from "react";

interface ParentGoalDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: { id: string; title: string; description: string } | null;
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const ParentGoalDialogContent = ({
  isOpen,
  onClose,
  goalToEdit,
  onSubmit,
  onDelete
}: ParentGoalDialogContentProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-apple-dark border-slate-800/80 text-white max-w-md">
          <DialogDescription className="sr-only">
            {goalToEdit ? "Edit Goal" : "Create New Goal"}
          </DialogDescription>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              {goalToEdit ? "Edit Goal" : "Create New Goal"}
            </h3>
          </div>
          
          <ParentGoalForm
            initialData={goalToEdit}
            onSubmit={onSubmit}
            onCancel={onClose}
            showHeader={false}
            onDelete={goalToEdit && onDelete ? handleDeleteClick : undefined}
          />
        </DialogContent>
      </Dialog>

      {goalToEdit && onDelete && (
        <DeleteParentGoalDialog
          title={goalToEdit.title}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
