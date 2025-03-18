
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { Goal } from "@/components/GoalRow";

// Local storage keys
const GUEST_PARENT_GOALS_KEY = 'loyde-guest-parent-goals';

/**
 * Get guest parent goals from local storage
 */
export const getGuestParentGoals = (): ParentGoal[] => {
  try {
    const storedGoals = localStorage.getItem(GUEST_PARENT_GOALS_KEY);
    if (storedGoals) {
      return JSON.parse(storedGoals);
    }
  } catch (error) {
    console.error('Error reading guest goals from localStorage:', error);
  }
  return [];
};

/**
 * Save guest parent goals to local storage
 */
export const saveGuestParentGoals = (goals: ParentGoal[]) => {
  try {
    localStorage.setItem(GUEST_PARENT_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving guest goals to localStorage:', error);
  }
};

/**
 * Add a new parent goal for guest
 */
export const addGuestParentGoal = (goal: Omit<ParentGoal, 'id'>): ParentGoal => {
  const goals = getGuestParentGoals();
  const newGoal: ParentGoal = {
    ...goal,
    id: `guest-${Date.now()}`,
    goals: [],
    position: goals.length,
  };
  
  goals.push(newGoal);
  saveGuestParentGoals(goals);
  return newGoal;
};

/**
 * Update an existing parent goal for guest
 */
export const updateGuestParentGoal = (goal: ParentGoal): boolean => {
  const goals = getGuestParentGoals();
  const index = goals.findIndex(g => g.id === goal.id);
  
  if (index !== -1) {
    goals[index] = goal;
    saveGuestParentGoals(goals);
    return true;
  }
  return false;
};

/**
 * Delete a parent goal for guest
 */
export const deleteGuestParentGoal = (id: string): boolean => {
  const goals = getGuestParentGoals();
  const newGoals = goals.filter(g => g.id !== id);
  
  if (newGoals.length !== goals.length) {
    saveGuestParentGoals(newGoals);
    return true;
  }
  return false;
};

/**
 * Add a sub-goal to a parent goal for guest
 */
export const addGuestSubGoal = (parentId: string, subGoal: Omit<Goal, 'id'>): Goal | null => {
  const goals = getGuestParentGoals();
  const parentIndex = goals.findIndex(g => g.id === parentId);
  
  if (parentIndex !== -1) {
    const newSubGoal: Goal = {
      ...subGoal,
      id: `guest-sub-${Date.now()}`
    };
    
    goals[parentIndex].goals.push(newSubGoal);
    saveGuestParentGoals(goals);
    return newSubGoal;
  }
  return null;
};

/**
 * Update a sub-goal for guest
 */
export const updateGuestSubGoal = (parentId: string, subGoal: Goal): boolean => {
  const goals = getGuestParentGoals();
  const parentIndex = goals.findIndex(g => g.id === parentId);
  
  if (parentIndex !== -1) {
    const subGoalIndex = goals[parentIndex].goals.findIndex(g => g.id === subGoal.id);
    
    if (subGoalIndex !== -1) {
      goals[parentIndex].goals[subGoalIndex] = subGoal;
      saveGuestParentGoals(goals);
      return true;
    }
  }
  return false;
};

/**
 * Delete a sub-goal for guest
 */
export const deleteGuestSubGoal = (parentId: string, subGoalId: string): boolean => {
  const goals = getGuestParentGoals();
  const parentIndex = goals.findIndex(g => g.id === parentId);
  
  if (parentIndex !== -1) {
    const originalLength = goals[parentIndex].goals.length;
    goals[parentIndex].goals = goals[parentIndex].goals.filter(g => g.id !== subGoalId);
    
    if (goals[parentIndex].goals.length !== originalLength) {
      saveGuestParentGoals(goals);
      return true;
    }
  }
  return false;
};

/**
 * Update the order of parent goals for guest
 */
export const updateGuestParentGoalOrder = (reorderedGoals: ParentGoal[]): boolean => {
  try {
    saveGuestParentGoals(reorderedGoals);
    return true;
  } catch (error) {
    console.error('Error updating goal order:', error);
    return false;
  }
};
