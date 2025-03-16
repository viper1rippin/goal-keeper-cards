
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";

interface ParentGoalDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: { id: string; title: string; description: string } | null;
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
}

export const ParentGoalDialogContent = ({
  isOpen,
  onClose,
  goalToEdit,
  onSubmit
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
        />
      </DialogContent>
    </Dialog>
  );
};
