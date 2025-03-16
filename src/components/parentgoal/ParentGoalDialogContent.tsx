
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ParentGoalForm from "../ParentGoalForm";

interface ParentGoalDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: { id: string; title: string; description: string } | null;
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
  onDelete: () => void;
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
        <ParentGoalForm
          initialData={goalToEdit}
          onSubmit={onSubmit}
          onCancel={onClose}
          showDelete={!!goalToEdit?.id}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
};
