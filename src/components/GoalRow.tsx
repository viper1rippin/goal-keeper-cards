import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useState, useEffect } from "react";
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
  display_order?: number; // Add display_order field
  startDate?: string; // Added for timeline sync
  endDate?: string; // Added for timeline sync
  timeline_row?: number; // Added for timeline sync
  timeline_start?: number; // Added for timeline sync
  timeline_duration?: number; // Added for timeline sync
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
  const { user } = useAuth(); // Get the current authenticated user
  
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
  
  // Fetch sub-goals for this parent goal
  const fetchSubGoals = async () => {
    try {
      setIsLoading(true);
      
      // Only proceed if user is authenticated
      if (!user) {
        setSubGoals([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id)
        .eq('user_id', user.id) // Only fetch user's own sub-goals
        .order('display_order', { ascending: true }); // Order by display_order
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedData: Goal[] = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress,
          display_order: goal.display_order,
          startDate: goal.start_date,
          endDate: goal.end_date,
          timeline_row: goal.timeline_row,
          timeline_start: goal.timeline_start,
          timeline_duration: goal.timeline_duration,
          // Handle user_id properly with type assertion if it exists on the database record
          ...(('user_id' in goal) ? { user_id: goal.user_id as string } : {})
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
  }, [id, user]);
  
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
