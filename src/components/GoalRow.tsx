
import { cn } from "@/lib/utils";
import GoalCard, { GoalCardProps } from "./GoalCard";
import AnimatedContainer from "./AnimatedContainer";
import { useState } from "react";

export interface Goal {
  title: string;
  description: string;
  progress: number;
}

interface GoalRowProps {
  title: string;
  description: string;
  goals: Goal[];
  index: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
}

const GoalRow = ({ 
  title, 
  description, 
  goals, 
  index: rowIndex,
  activeGoal,
  onGoalFocus
}: GoalRowProps) => {
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // Track which goal is currently focused
  const [focusedGoalIndex, setFocusedGoalIndex] = useState<number | null>(null);
  
  return (
    <AnimatedContainer 
      animation="fade-in" 
      delay={rowDelay}
      className="mb-12 last:mb-0"
    >
      <div className="mb-4">
        <div className="py-1 px-3 bg-slate-800/50 rounded-md inline-block mb-2">
          <span className="text-xs font-medium text-emerald/90">Parent Goal</span>
        </div>
        <h2 className="text-2xl font-semibold mb-1">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal, goalIndex) => {
          const isActiveGoal = activeGoal?.rowIndex === rowIndex && activeGoal?.goalIndex === goalIndex;
          
          return (
            <GoalCard 
              key={goalIndex}
              title={goal.title}
              description={goal.description}
              progress={goal.progress}
              index={goalIndex}
              isFocused={focusedGoalIndex === goalIndex}
              isActiveFocus={isActiveGoal}
              onFocus={() => setFocusedGoalIndex(prevIndex => prevIndex === goalIndex ? null : goalIndex)}
              onStartFocus={() => onGoalFocus(goal, rowIndex, goalIndex)}
            />
          );
        })}
      </div>
    </AnimatedContainer>
  );
};

export default GoalRow;
