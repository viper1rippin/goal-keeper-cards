
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";

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
        <DialogTitle className="sr-only">
          {goalToEdit ? "Edit Goal" : "Create New Goal"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {goalToEdit ? "Edit your existing goal" : "Create a new goal"}
        </DialogDescription>
        <ParentGoalForm
          initialData={goalToEdit}
          onSubmit={onSubmit}
          onCancel={onClose}
          onDelete={goalToEdit ? onDelete : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};
