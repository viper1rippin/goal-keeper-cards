
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Goal } from '@/components/GoalRow';

export interface ParentGoal {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  position?: number;
}

export const useParentGoals = () => {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchParentGoals = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch parent goals
      const { data: parentGoalsData, error: parentGoalsError } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (parentGoalsError) throw parentGoalsError;

      // Fetch sub-goals for each parent goal
      const goalsWithSubGoals = await Promise.all(
        (parentGoalsData || []).map(async (parentGoal) => {
          const { data: subGoals, error: subGoalsError } = await supabase
            .from('sub_goals')
            .select('*')
            .eq('parent_goal_id', parentGoal.id)
            .order('display_order', { ascending: true });

          if (subGoalsError) throw subGoalsError;

          return {
            ...parentGoal,
            goals: (subGoals || []).map(sg => ({
              id: sg.id,
              title: sg.title,
              description: sg.description,
              progress: sg.progress
            }))
          };
        })
      );

      setParentGoals(goalsWithSubGoals);

    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
      toast({
        title: 'Error fetching goals',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubGoal = async (subGoal: Goal) => {
    if (!user || !subGoal.id) return;

    try {
      const { error } = await supabase
        .from('sub_goals')
        .update({
          title: subGoal.title,
          description: subGoal.description,
          progress: subGoal.progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subGoal.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setParentGoals(prevGoals =>
        prevGoals.map(parentGoal => ({
          ...parentGoal,
          goals: parentGoal.goals.map(goal =>
            goal.id === subGoal.id ? subGoal : goal
          ),
        }))
      );

      return true;
    } catch (err) {
      console.error('Error updating sub-goal:', err);
      toast({
        title: 'Error updating sub-goal',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteSubGoal = async (subGoalId: string) => {
    if (!user || !subGoalId) return;

    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', subGoalId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setParentGoals(prevGoals =>
        prevGoals.map(parentGoal => ({
          ...parentGoal,
          goals: parentGoal.goals.filter(goal => goal.id !== subGoalId),
        }))
      );

      return true;
    } catch (err) {
      console.error('Error deleting sub-goal:', err);
      toast({
        title: 'Error deleting sub-goal',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchParentGoals();
  }, [user]);

  return {
    parentGoals,
    isLoading,
    error,
    fetchParentGoals,
    updateSubGoal,
    deleteSubGoal,
  };
};
