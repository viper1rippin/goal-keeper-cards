
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";
import { ParentGoalData } from "@/types/goal-types";

interface ParentGoalDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: ParentGoalData | null;
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
