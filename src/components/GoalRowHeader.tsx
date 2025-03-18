
import React from 'react';
import { GripVertical } from "lucide-react";

interface GoalRowHeaderProps {
  title: string;
  description: string;
  attributes: any;
  listeners: any;
}

const GoalRowHeader: React.FC<GoalRowHeaderProps> = ({ 
  title, 
  description,
  attributes,
  listeners
}) => {
  return (
    <div className="mb-4 flex items-start">
      <div 
        className="mt-2 mr-3 cursor-grab p-1 hover:bg-slate-800/50 rounded text-slate-500 hover:text-emerald transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1">
        <div className="py-1 px-3 bg-slate-800/50 rounded-md inline-block mb-2">
          <span className="text-xs font-medium text-emerald/90">Parent Goal</span>
        </div>
        <h2 className="text-2xl font-semibold mb-1">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default GoalRowHeader;
