
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@/components/GoalRow";
import { ParentGoalData, SubGoalData, MappedParentGoal } from "../types/goalTypes";

export const useAuthenticatedGoals = (userId: string | undefined) => {
  const { toast } = useToast();

  // Function to fetch parent goals for authenticated users
  const fetchAuthenticatedGoals = useCallback(async (): Promise<MappedParentGoal[]> => {
    if (!userId) return [];
    
    try {
      // Fetch parent goals
      const { data: parentGoalsData, error: parentGoalsError } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });
      
      if (parentGoalsError) throw parentGoalsError;
      
      // Fetch sub goals
      const { data: subGoalsData, error: subGoalsError } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('user_id', userId)
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
      return ((parentGoalsData as ParentGoalData[]) || []).map(parent => ({
        id: parent.id,
        title: parent.title,
        description: parent.description,
        position: parent.position || 0,
        goals: groupedSubGoals[parent.id] || [],
        user_id: parent.user_id
      }));
      
    } catch (error) {
      console.error('Error fetching authenticated goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  }, [userId, toast]);

  // Function to save parent goal order for authenticated users
  const saveAuthenticatedGoalOrder = useCallback(async (reorderedGoals: MappedParentGoal[]) => {
    if (!userId) return false;
    
    try {
      // Create an array of updates for each goal
      for (const goal of reorderedGoals) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ position: reorderedGoals.findIndex(g => g.id === goal.id) })
          .eq('id', goal.id)
          .eq('user_id', userId);
          
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error updating authenticated goal order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal order. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  // Function to delete a parent goal for authenticated users
  const deleteAuthenticatedParentGoal = useCallback(async (id: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
      
    } catch (error) {
      console.error('Error deleting authenticated goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  // Function to delete a sub goal for authenticated users
  const deleteAuthenticatedSubGoal = useCallback(async (id: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
      
    } catch (error) {
      console.error('Error deleting authenticated sub-goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub-goal. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  return {
    fetchAuthenticatedGoals,
    saveAuthenticatedGoalOrder,
    deleteAuthenticatedParentGoal,
    deleteAuthenticatedSubGoal
  };
};
