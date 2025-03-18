
import { GripHorizontal } from "lucide-react";
import React from "react";

interface GoalCardDragHandleProps extends React.HTMLAttributes<HTMLDivElement> {}

const GoalCardDragHandle: React.FC<GoalCardDragHandleProps> = (props) => {
  return (
    <div
      className="absolute top-2 left-2 p-1.5 text-slate-500 opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      {...props}
    >
      <GripHorizontal size={14} />
    </div>
  );
};

export default GoalCardDragHandle;
