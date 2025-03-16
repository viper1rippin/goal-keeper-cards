
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { POINTS_PER_MINUTE, getPointsForNextLevel } from "@/utils/timerUtils";
import { Goal } from "@/components/GoalRow";

interface UseTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  activeGoal?: Goal | null;
}

export function useTimer({ userLevel, onLevelUp, activeGoal }: UseTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  
  // Use a ref to track interval ID to prevent issues with stale closures
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const pointsForNextLevel = getPointsForNextLevel(userLevel);

  // Auto-start timer when activeGoal changes to non-null
  useEffect(() => {
    if (activeGoal && !isActive && time === 0) {
      // Only auto-start if the timer is not already running and at zero
      setIsActive(true);
    }
  }, [activeGoal, isActive, time]);

  // Show toast when timer starts/pauses, but separate from the state update
  useEffect(() => {
    if (isActive) {
      toast({
        title: activeGoal 
          ? `Focusing on: ${activeGoal.title}` 
          : "Focus mode activated",
        description: "Stay focused and earn points to level up",
      });
    } else if (time > 0) { // Only show pause toast if timer was running
      toast({
        title: "Timer paused",
        description: "Your focus session is paused. Resume when you're ready.",
      });
    }
  }, [isActive, activeGoal, toast, time]);

  // Toggle timer separately from the toast notifications
  const toggleTimer = () => {
    // Clean up existing interval before toggling state to prevent race conditions
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Then toggle the state
    setIsActive(prevActive => !prevActive);
  };

  // Reset timer
  const resetTimer = () => {
    // First ensure timer is stopped
    setIsActive(false);
    
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
    
    if (isActive) {
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
  }, [isActive]); // Only depend on isActive

  return {
    isActive,
    time,
    earnedPoints,
    pointsForNextLevel,
    toggleTimer,
    resetTimer
  };
}
