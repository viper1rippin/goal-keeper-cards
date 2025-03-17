import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useState, useEffect, useCallback } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GoalRowHeader from "./GoalRowHeader";
import SubGoalsSection from "./SubGoalsSection";
import { useAuth } from "@/context/AuthContext";

export interface Goal {
  id?: string;
  title: string;
  description: string;
  progress: number;
  user_id?: string;
}

interface GoalRowProps {
  title: string;
  description: string;
  goals: Goal[];
  index: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  onDeleteSubGoal: (subGoalId: string) => Promise<void>;
  id: string;
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
  const { user } = useAuth();
  
  // State for sub-goals loaded from the database
  const [subGoals, setSubGoals] = useState<Goal[]>(goals);
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply transform styles from dnd-kit for the row
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // Fetch sub-goals for this parent goal - use useCallback to prevent unnecessary rerenders
  const fetchSubGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Only proceed if user is authenticated
      if (!user) {
        setSubGoals([]);
        setIsLoading(false);
        return;
      }

      console.log("Fetching sub-goals for parent:", id, "user:", user.id);

      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (data) {
        console.log("Sub-goals fetched:", data.length);
        const formattedData = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress,
          user_id: goal.user_id
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
  }, [id, user, rowIndex, onUpdateSubGoals, toast]);
  
  // Fetch sub-goals when the component mounts or user/id changes
  useEffect(() => {
    if (user && id) {
      fetchSubGoals();
    }
  }, [id, user, fetchSubGoals]);
  
  // Handler to update sub-goals from child component
  const handleUpdateSubGoals = (updatedGoals: Goal[]) => {
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
