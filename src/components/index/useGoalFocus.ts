
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
  
  // Handle goal focus - only set focus state, don't start timer
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Save current scroll position before changing state
    const scrollPosition = window.scrollY;
    
    // Set the active goal - but don't show the timer or set it as focused
    setActiveGoal(null); // First set to null to clear any existing active goal
    setActiveGoalIndices(null); // Clear active indices
    
    // Note: We removed auto-focusing completely to stop focus timer behavior
    
    // Restore scroll position after state updates
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto"
      });
    }, 0);
    
    // Show toast notification for future feature
    toast({
      title: "Project Detail View",
      description: "This feature will be implemented soon.",
      variant: "default",
    });
  };
  
  // Handle starting focus explicitly (for timer button)
  const handleStartFocus = () => {
    if (activeGoal) {
      setShowFocusTimer(true);
    }
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
    handleStartFocus, // Explicit method to start timer
    handleStopFocus,
    setActiveGoalIndices  // Export this function so it can be used in IndexPageContext
  };
}
