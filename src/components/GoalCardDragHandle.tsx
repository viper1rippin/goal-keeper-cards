
import { GripHorizontal } from "lucide-react";

const GoalCardDragHandle = () => {
  return (
    <div className="absolute top-2 left-2 p-1.5 text-slate-500 opacity-50 hover:opacity-100 transition-opacity cursor-grab z-10">
      <GripHorizontal size={14} />
    </div>
  );
};

export default GoalCardDragHandle;
