
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { POINTS_PER_MINUTE, getPointsForNextLevel } from "@/utils/timerUtils";
import { Goal } from "@/components/GoalRow";

// Define timer states for better state management
type TimerState = "IDLE" | "RUNNING" | "PAUSED";

interface UseTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  activeGoal?: Goal | null;
}

export function useTimer({ userLevel, onLevelUp, activeGoal }: UseTimerProps) {
  // Replace boolean isActive with a state machine
  const [timerState, setTimerState] = useState<TimerState>("IDLE");
  const [time, setTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  
  // Use a ref to track interval ID to prevent issues with stale closures
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref to track if a toggle is in progress to prevent rapid clicks
  const isTogglingRef = useRef(false);
  
  // Compute derived state for backward compatibility
  const isActive = timerState === "RUNNING";
  
  const pointsForNextLevel = getPointsForNextLevel(userLevel);

  // Remove auto-start behavior when activeGoal changes
  // This was causing the timer to start automatically

  // Toggle timer with debouncing to prevent rapid state changes
  const toggleTimer = () => {
    // Prevent rapid toggles that can cause glitches
    if (isTogglingRef.current) {
      return;
    }
    
    // Set toggling flag
    isTogglingRef.current = true;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Update state based on current state (state machine transition)
    setTimerState(prevState => {
      if (prevState === "RUNNING") return "PAUSED";
      return "RUNNING";
    });
    
    // Reset toggling flag after a short delay to prevent rapid clicks
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 300);
  };

  // Reset timer
  const resetTimer = () => {
    // First ensure timer is stopped
    setTimerState("IDLE");
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only add points if there was some time spent
    if (time > 0) {
      const newPoints = Math.floor((time / 60) * POINTS_PER_MINUTE);
      setEarnedPoints(prev => prev + newPoints);
      
      // Check if user leveled up
      const totalPoints = earnedPoints + newPoints;
      if (totalPoints >= pointsForNextLevel) {
        onLevelUp(userLevel + 1);
        
        // Level up notification still shown but can be removed if needed
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${userLevel + 1}`,
          variant: "default",
        });
      }
    }
    
    // Reset the timer
    setTime(0);
  };

  // Timer effect, now using the ref to track the interval
  useEffect(() => {
    // Clean up existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timerState === "RUNNING") {
      // Set up a new interval if timer is active
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]); // Only depend on timerState

  return {
    isActive, // Keep for backward compatibility
    timerState,
    time,
    earnedPoints,
    pointsForNextLevel,
    toggleTimer,
    resetTimer
  };
}
