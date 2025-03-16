
import { useState, useRef, useEffect } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";

export function useGoalFocus() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const { toast } = useToast();
  
  // Flag to prevent scrolling when a goal is focused
  const preventScroll = useRef(false);
  
  // Handle goal focus - this is the key function to ensure only one goal is active
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Set prevent scroll flag
    preventScroll.current = true;
    
    // Otherwise, set the new active goal
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
  };
  
  // Effect to prevent scrolling
  useEffect(() => {
    if (preventScroll.current) {
      // Store current scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      // Set a short timeout to restore scroll position after the DOM updates
      setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
        preventScroll.current = false;
      }, 10);
    }
  }, [activeGoal, activeGoalIndices]);
  
  // Handle stopping focus
  const handleStopFocus = () => {
    // Set prevent scroll flag
    preventScroll.current = true;
    
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
