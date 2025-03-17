import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { POINTS_PER_MINUTE, getPointsForNextLevel } from "@/utils/timerUtils";
import { SubGoal } from "@/types/goal-types";

type TimerState = "IDLE" | "RUNNING" | "PAUSED";

interface UseTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  activeGoal?: SubGoal | null;
}

export function useTimer({ userLevel, onLevelUp, activeGoal }: UseTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>("IDLE");
  const [time, setTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTogglingRef = useRef(false);
  
  const isActive = timerState === "RUNNING";
  
  const pointsForNextLevel = getPointsForNextLevel(userLevel);

  useEffect(() => {
    if (activeGoal && timerState === "IDLE" && time === 0) {
      setTimerState("RUNNING");
    }
  }, [activeGoal, timerState, time]);

  const toggleTimer = () => {
    if (isTogglingRef.current) {
      return;
    }
    
    isTogglingRef.current = true;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState(prevState => {
      if (prevState === "RUNNING") return "PAUSED";
      return "RUNNING";
    });
    
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 300);
  };

  const resetTimer = () => {
    setTimerState("IDLE");
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (time > 0) {
      const newPoints = Math.floor((time / 60) * POINTS_PER_MINUTE);
      setEarnedPoints(prev => prev + newPoints);
      
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
    
    setTime(0);
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timerState === "RUNNING") {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  return {
    isActive,
    timerState,
    time,
    earnedPoints,
    pointsForNextLevel,
    toggleTimer,
    resetTimer
  };
}
