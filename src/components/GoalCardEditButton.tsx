
import { Edit2 } from "lucide-react";

interface GoalCardEditButtonProps {
  isHovered: boolean;
  onEdit: () => void;
  size?: number;
}

const GoalCardEditButton = ({ isHovered, onEdit, size = 14 }: GoalCardEditButtonProps) => {
  if (!onEdit || !isHovered) return null;
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/70 text-emerald hover:bg-slate-700/80 transition-colors z-10"
      aria-label="Edit sub-goal"
    >
      <Edit2 size={size} />
    </button>
  );
};

export default GoalCardEditButton;
