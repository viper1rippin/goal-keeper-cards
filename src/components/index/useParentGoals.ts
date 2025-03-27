
import { useState, useCallback } from "react";
import { Goal } from "@/components/GoalRow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ParentGoal } from "./IndexPageTypes";

// Type for parent goal from Supabase, avoiding deep nesting
interface ParentGoalData {
  id: string;
  title: string;
  description: string;
  position: number | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Type for sub goal from Supabase
interface SubGoalData {
  id: string;
  title: string;
  description: string;
  progress: number;
  parent_goal_id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export const useParentGoals = (goalToEdit: ParentGoal | null) => {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to fetch parent goals
  const fetchParentGoals = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch parent goals
      const { data: parentGoalsData, error: parentGoalsError } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });
      
      if (parentGoalsError) throw parentGoalsError;
      
      // Fetch sub goals
      const { data: subGoalsData, error: subGoalsError } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (subGoalsError) throw subGoalsError;
      
      // Group sub goals by parent goal
      const groupedSubGoals: Record<string, Goal[]> = {};
      
      // Initialize groups
      ((parentGoalsData as ParentGoalData[]) || []).forEach(parent => {
        groupedSubGoals[parent.id] = [];
      });
      
      // Populate groups
      ((subGoalsData as SubGoalData[]) || []).forEach(subGoal => {
        if (groupedSubGoals[subGoal.parent_goal_id]) {
          groupedSubGoals[subGoal.parent_goal_id].push({
            id: subGoal.id,
            title: subGoal.title,
            description: subGoal.description,
            progress: subGoal.progress
          });
        }
      });
      
      // Map parent goals with their sub goals
      const mappedParentGoals = ((parentGoalsData as ParentGoalData[]) || []).map(parent => ({
        id: parent.id,
        title: parent.title,
        description: parent.description,
        position: parent.position || 0,
        goals: groupedSubGoals[parent.id] || [],
        user_id: parent.user_id
      }));
      
      setParentGoals(mappedParentGoals);
      
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Function to save parent goal order
  const saveParentGoalOrder = useCallback(async (reorderedGoals: ParentGoal[]) => {
    if (!user) return;
    
    try {
      // Create an array of updates for each goal
      for (const goal of reorderedGoals) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ position: reorderedGoals.findIndex(g => g.id === goal.id) })
          .eq('id', goal.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
    } catch (error) {
      console.error('Error updating goal order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal order. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Function to delete a parent goal
  const deleteParentGoal = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      // Delete parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update state
      setParentGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });
      
      // Refetch goals to ensure consistent state
      fetchParentGoals();
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast, fetchParentGoals]);

  // Function to delete a sub goal
  const deleteSubGoal = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      // Delete sub goal
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Sub-goal deleted successfully',
      });
      
    } catch (error) {
      console.error('Error deleting sub-goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub-goal. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  return {
    parentGoals,
    setParentGoals,
    isLoading,
    fetchParentGoals,
    saveParentGoalOrder,
    deleteParentGoal,
    deleteSubGoal
  };
};
