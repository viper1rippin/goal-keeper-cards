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
import { TimelineCategory } from "./roadmap/types";

export interface Goal {
  id?: string;
  title: string;
  description: string;
  progress: number;
  user_id?: string;
  display_order?: number;
  color?: string;
  startDate?: string;
  endDate?: string;
  category?: TimelineCategory;
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

  const [subGoals, setSubGoals] = useState<Goal[]>(goals);
  const [isLoading, setIsLoading] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const rowDelay = rowIndex * 100;

  const fetchSubGoals = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setSubGoals([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedData = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress,
          display_order: goal.display_order,
          ...(('user_id' in goal) ? { user_id: goal.user_id as string } : {})
        }));

        setSubGoals(formattedData);
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

  useEffect(() => {
    fetchSubGoals();
  }, [id, user]);

  const handleUpdateSubGoals = (updatedGoals: Goal[]) => {
    fetchSubGoals();
  };

  const handleDeleteSubGoal = async (subGoalId: string) => {
    if (!subGoalId) return;

    await onDeleteSubGoal(subGoalId);
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
