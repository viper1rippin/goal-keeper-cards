
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useState, useEffect } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GoalRowHeader from "./GoalRowHeader";
import SubGoalsSection from "./SubGoalsSection";
import { SubGoal } from "@/types/goal-types";

interface GoalRowProps {
  title: string;
  description: string;
  goals: SubGoal[];
  index: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: SubGoal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: SubGoal[]) => void;
  onDeleteSubGoal: (subGoalId: string) => Promise<void>;
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
  onDeleteSubGoal,
  id
}: GoalRowProps) => {
  // Setup sortable hook from dnd-kit for the row itself
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
  const [subGoals, setSubGoals] = useState<SubGoal[]>(goals);
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply transform styles from dnd-kit for the row
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // Fetch sub-goals for this parent goal
  const fetchSubGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id)
        .order('created_at', { ascending: true });
      
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
  
  // Handler to update sub-goals from child component
  const handleUpdateSubGoals = (updatedGoals: SubGoal[]) => {
    // If this was called from a child component we refetch to ensure fresh data
    fetchSubGoals();
  };

  // Handle deleting a sub-goal
  const handleDeleteSubGoal = async (subGoalId: string) => {
    if (!subGoalId) return;
    
    await onDeleteSubGoal(subGoalId);
    // Refresh the list after deletion
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
        <GoalRowHeader 
          title={title}
          description={description}
          attributes={attributes}
          listeners={listeners}
        />
        
        <div className="pl-8">
          <SubGoalsSection 
            subGoals={subGoals}
            parentTitle={title}
            parentId={id}
            rowIndex={rowIndex}
            activeGoal={activeGoal}
            onGoalFocus={onGoalFocus}
            onUpdateSubGoals={handleUpdateSubGoals}
            onDeleteSubGoal={handleDeleteSubGoal}
            isLoading={isLoading}
          />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default GoalRow;
