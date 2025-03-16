
import { Edit3, PenBox } from "lucide-react";

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
      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/80 text-emerald/90 hover:text-emerald hover:bg-slate-700/90 hover:shadow-emerald/10 hover:shadow-sm transition-all duration-200 z-10"
      aria-label="Edit sub-goal"
    >
      <PenBox size={size} strokeWidth={2} className="animate-fade-in" />
    </button>
  );
};

export default GoalCardEditButton;
