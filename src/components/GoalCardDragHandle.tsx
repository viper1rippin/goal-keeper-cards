
import { GripHorizontal } from "lucide-react";

interface GoalCardDragHandleProps {
  [key: string]: any; // For passing through attributes and listeners
}

const GoalCardDragHandle = (props: GoalCardDragHandleProps) => {
  return (
    <div 
      className="absolute top-2 left-2 p-1.5 text-slate-500 hover:opacity-100 opacity-50 transition-opacity cursor-grab z-10"
      {...props}
    >
      <GripHorizontal size={14} />
    </div>
  );
};

export default GoalCardDragHandle;
