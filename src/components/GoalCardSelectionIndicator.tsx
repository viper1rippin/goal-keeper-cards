
import React from 'react';
import { cn } from '@/lib/utils';
import { useSelection } from '@/context/SelectionContext';
import { Goal } from './GoalRow';
import { CheckCircle } from 'lucide-react';

interface GoalCardSelectionIndicatorProps {
  goal: Goal;
  className?: string;
}

const GoalCardSelectionIndicator: React.FC<GoalCardSelectionIndicatorProps> = ({
  goal,
  className
}) => {
  const { isSelected } = useSelection();
  
  if (!goal.id) return null;
  
  const selected = isSelected(goal.id);
  
  return (
    <div 
      className={cn(
        "absolute top-2 left-2 z-10 w-5 h-5 rounded-full transition-colors duration-200",
        selected 
          ? "bg-emerald text-white flex items-center justify-center" 
          : "border-2 border-slate-600 bg-transparent hover:border-emerald/80",
        className
      )}
    >
      {selected && <CheckCircle size={14} className="stroke-[3]" />}
    </div>
  );
};

export default GoalCardSelectionIndicator;
