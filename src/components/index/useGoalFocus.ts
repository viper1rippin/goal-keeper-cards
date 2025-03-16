
import { useState, useRef, useEffect } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";

export function useGoalFocus() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const { toast } = useToast();
  
  // More reliable approach to prevent scrolling
  const scrollPosition = useRef({ x: 0, y: 0 });
  
  // Handle goal focus - this is the key function to ensure only one goal is active
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Save current scroll position BEFORE state updates
    scrollPosition.current = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    // First set the new active goal
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
    
    // Use requestAnimationFrame to restore scroll position AFTER rendering
    requestAnimationFrame(() => {
      window.scrollTo(scrollPosition.current.x, scrollPosition.current.y);
    });
  };
  
  // Handle stopping focus
  const handleStopFocus = () => {
    // Save current scroll position BEFORE state updates
    scrollPosition.current = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    // Clear both the active goal and its indices
    setActiveGoal(null);
    setActiveGoalIndices(null);
    
    // Use requestAnimationFrame to restore scroll position AFTER rendering
    requestAnimationFrame(() => {
      window.scrollTo(scrollPosition.current.x, scrollPosition.current.y);
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
