
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { POINTS_PER_MINUTE } from "@/utils/timerUtils";
import { Goal } from "@/components/GoalRow";

interface UseTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  activeGoal?: Goal | null;
}

export const useTimer = ({ userLevel, onLevelUp, activeGoal }: UseTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();

  // Auto-start timer when activeGoal changes to non-null
  useEffect(() => {
    if (activeGoal && !isActive) {
      setIsActive(true);
      toast({
        title: `Focusing on: ${activeGoal.title}`,
        description: "Timer started automatically. Stay focused!",
      });
    }
  }, [activeGoal, toast, isActive]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      interval && clearInterval(interval);
    }
    
    return () => {
      interval && clearInterval(interval);
    };
  }, [isActive, time]);

  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive);
    
    if (!isActive) {
      toast({
        title: activeGoal 
          ? `Focusing on: ${activeGoal.title}` 
          : "Focus mode activated",
        description: "Stay focused and earn points to level up",
      });
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    
    // Only add points if there was some time spent
    if (time > 0) {
      const newPoints = (time / 60) * POINTS_PER_MINUTE;
      setEarnedPoints(prev => prev + newPoints);
      
      // Check if user leveled up
      const totalPoints = earnedPoints + newPoints;
      const pointsForNextLevel = 1440; // 24 hours in minutes
      
      if (totalPoints >= pointsForNextLevel) {
        onLevelUp(userLevel + 1);
        
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${userLevel + 1}`,
          variant: "default",
        });
      }
    }
    
    setTime(0);
  };

  return {
    isActive,
    time,
    earnedPoints,
    toggleTimer,
    resetTimer
  };
};
