
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import DeleteParentGoalDialog from "./DeleteParentGoalDialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-apple-dark border-slate-800/80 text-white max-w-md">
        <DialogDescription className="sr-only">
          {goalToEdit ? "Edit Goal" : "Create New Goal"}
        </DialogDescription>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {goalToEdit ? "Edit Goal" : "Create New Goal"}
          </h3>
          
          {goalToEdit && onDelete && (
            <DeleteParentGoalDialog
              title={goalToEdit.title}
              onDelete={onDelete}
            />
          )}
        </div>
        
        <ParentGoalForm
          initialData={goalToEdit}
          onSubmit={onSubmit}
          onCancel={onClose}
          showHeader={false}
        />
      </DialogContent>
    </Dialog>
  );
};
