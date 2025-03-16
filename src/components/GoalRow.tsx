
import { cn } from "@/lib/utils";
import GoalCard, { GoalCardProps } from "./GoalCard";
import AnimatedContainer from "./AnimatedContainer";
import { useState, useEffect } from "react";
import SubGoalAddCard from "./SubGoalAddCard";
import SubGoalDialog from "./SubGoalDialog";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Goal {
  id?: string;
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
  id: string; // Added id prop for drag and drop
}

const GoalRow = ({ 
  title, 
  description, 
  goals, 
  index: rowIndex,
  activeGoal,
  onGoalFocus,
  onUpdateSubGoals,
  id
}: GoalRowProps) => {
  // Setup sortable hook from dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const { toast } = useToast();
  
  // State for sub-goals loaded from the database
  const [subGoals, setSubGoals] = useState<Goal[]>(goals);
  const [isLoading, setIsLoading] = useState(false);

  // Apply transform styles from dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // Remove local focused state - we'll only use the activeGoal from props to determine focus
  // This ensures only one card is highlighted across the entire app
  
  // State for sub-goal dialog
  const [isSubGoalDialogOpen, setIsSubGoalDialogOpen] = useState(false);
  const [subGoalToEdit, setSubGoalToEdit] = useState<Goal | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  
  // Fetch sub-goals for this parent goal
  const fetchSubGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedData = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress
        }));
        
        setSubGoals(formattedData);
        // Also update the parent component's state
        onUpdateSubGoals(rowIndex, formattedData);
      }
    } catch (error) {
      console.error("Error fetching sub-goals:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-goals. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch sub-goals when the component mounts
  useEffect(() => {
    fetchSubGoals();
  }, [id]);
  
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
    // Close the dialog and refresh sub-goals
    setIsSubGoalDialogOpen(false);
    fetchSubGoals();
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-12 last:mb-0 relative"
    >
      <AnimatedContainer 
        animation="fade-in" 
        delay={rowDelay}
      >
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-8">
          {isLoading ? (
            <div className="col-span-4 py-8 text-center text-slate-400">
              Loading sub-goals...
            </div>
          ) : (
            <>
              {subGoals.map((goal, goalIndex) => {
                const isActiveGoal = activeGoal?.rowIndex === rowIndex && activeGoal?.goalIndex === goalIndex;
                
                return (
                  <GoalCard 
                    key={goal.id || goalIndex}
                    title={goal.title}
                    description={goal.description}
                    progress={goal.progress}
                    index={goalIndex}
                    isFocused={isActiveGoal} // Now only one card can be focused at a time
                    isActiveFocus={isActiveGoal}
                    onFocus={() => onGoalFocus(goal, rowIndex, goalIndex)} // Always call the parent focus handler
                    onStartFocus={() => onGoalFocus(goal, rowIndex, goalIndex)}
                    onEdit={() => handleEditSubGoal(goal, goalIndex)}
                  />
                );
              })}
              
              {/* Add Sub-Goal Card */}
              <SubGoalAddCard 
                onClick={handleAddSubGoal} 
                index={subGoals.length}
              />
            </>
          )}
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
          parentGoalId={id}
        />
      </AnimatedContainer>
    </div>
  );
};

export default GoalRow;
