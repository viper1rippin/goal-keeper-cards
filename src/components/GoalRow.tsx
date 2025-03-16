
import { cn } from "@/lib/utils";
import GoalCard, { GoalCardProps } from "./GoalCard";
import AnimatedContainer from "./AnimatedContainer";
import { useState } from "react";
import SubGoalAddCard from "./SubGoalAddCard";
import SubGoalDialog from "./SubGoalDialog";

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
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
}

const GoalRow = ({ 
  title, 
  description, 
  goals, 
  index: rowIndex,
  activeGoal,
  onGoalFocus,
  onUpdateSubGoals
}: GoalRowProps) => {
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // Track which goal is currently focused
  const [focusedGoalIndex, setFocusedGoalIndex] = useState<number | null>(null);
  
  // State for sub-goal dialog
  const [isSubGoalDialogOpen, setIsSubGoalDialogOpen] = useState(false);
  const [subGoalToEdit, setSubGoalToEdit] = useState<Goal | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  
  // Handle adding a new sub-goal
  const handleAddSubGoal = () => {
    setSubGoalToEdit(null);
    setEditingGoalIndex(null);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle editing an existing sub-goal
  const handleEditSubGoal = (goal: Goal, index: number) => {
    setSubGoalToEdit(goal);
    setEditingGoalIndex(index);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle saving sub-goal (both add and edit)
  const handleSaveSubGoal = (subGoal: Omit<Goal, 'progress'>) => {
    let updatedGoals: Goal[];
    
    if (editingGoalIndex !== null) {
      // Edit existing sub-goal
      updatedGoals = [...goals];
      updatedGoals[editingGoalIndex] = {
        ...updatedGoals[editingGoalIndex],
        ...subGoal
      };
    } else {
      // Add new sub-goal
      updatedGoals = [
        ...goals,
        { ...subGoal, progress: 0 }
      ];
    }
    
    onUpdateSubGoals(rowIndex, updatedGoals);
    setIsSubGoalDialogOpen(false);
  };
  
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
              onEdit={() => handleEditSubGoal(goal, goalIndex)}
            />
          );
        })}
        
        {/* Add Sub-Goal Card */}
        <SubGoalAddCard 
          onClick={handleAddSubGoal} 
          index={goals.length}
        />
      </div>
      
      {/* Sub-Goal Dialog for adding/editing */}
      <SubGoalDialog
        isOpen={isSubGoalDialogOpen}
        onClose={() => {
          setIsSubGoalDialogOpen(false);
          setSubGoalToEdit(null);
          setEditingGoalIndex(null);
        }}
        onSave={handleSaveSubGoal}
        subGoalToEdit={subGoalToEdit}
        parentGoalTitle={title}
      />
    </AnimatedContainer>
  );
};

export default GoalRow;
