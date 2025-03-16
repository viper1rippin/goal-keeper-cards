
import { useState } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";

export function useGoalFocus() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const { toast } = useToast();
  
  // Handle goal focus - this is the key function to ensure only one goal is active
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Otherwise, set the new active goal
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
    
    // Show toast to indicate the focus change
    toast({
      title: `Now focusing on: ${goal.title}`,
      description: "Focus mode activated for this goal",
    });
  };
  
  // Handle stopping focus
  const handleStopFocus = () => {
    // Clear both the active goal and its indices
    setActiveGoal(null);
    setActiveGoalIndices(null);
    
    // Show toast to indicate focus has stopped
    toast({
      title: "Focus ended",
      description: "You've stopped focusing on all goals",
    });
  };
  
  return {
    activeGoal,
    activeGoalIndices,
    showFocusTimer,
    setShowFocusTimer,
    handleGoalFocus,
    handleStopFocus,
    setActiveGoalIndices  // Export this function so it can be used in IndexPageContext
  };
}
