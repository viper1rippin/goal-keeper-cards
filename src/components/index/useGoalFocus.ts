
import { useState, useLayoutEffect } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";

export function useGoalFocus() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const { toast } = useToast();
  
  // Store the scroll position when showing focus timer
  useLayoutEffect(() => {
    if (showFocusTimer) {
      // Save current scroll position
      const scrollPosition = window.scrollY;
      
      // After the timer appears in the DOM, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: "auto" // Use "auto" instead of "smooth" to prevent visible scrolling
        });
      }, 0);
    }
  }, [showFocusTimer]);
  
  // Handle goal focus - this is the key function to ensure only one goal is active
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Save current scroll position before changing state
    const scrollPosition = window.scrollY;
    
    // Otherwise, set the new active goal
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
    
    // Restore scroll position after state updates
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto"
      });
    }, 0);
  };
  
  // Handle stopping focus
  const handleStopFocus = () => {
    // Clear both the active goal and its indices
    setActiveGoal(null);
    setActiveGoalIndices(null);
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
