
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Timer, X } from "lucide-react";
import UserBadge from "./UserBadge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "./GoalRow";

// Points earned per minute of focus
// 24 hours = 1440 minutes, so we need 1440 points for a level up
// 1 point per minute = 1440 points per day = 1 level per day (24 hours)
const POINTS_PER_MINUTE = 1;

interface FocusTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  onClose: () => void;
  activeGoal?: Goal | null;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  userLevel, 
  onLevelUp,
  onClose,
  activeGoal
}) => {
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
  }, [activeGoal, toast]);

  // Calculate points needed for next level
  const getPointsForNextLevel = (level: number) => {
    // Each level requires 24 hours (1440 minutes) of focus time
    return 1440;
  };

  const pointsForNextLevel = getPointsForNextLevel(userLevel);
  
  // Format time as HH:MM:SS to better display long focus sessions
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Calculate progress percentage
  const progressPercent = Math.min(
    100, 
    (earnedPoints / pointsForNextLevel) * 100
  );

  // Calculate time needed for next level (in hours)
  const minutesForNextLevel = Math.ceil((pointsForNextLevel - earnedPoints) / POINTS_PER_MINUTE);
  const hoursForNextLevel = Math.ceil(minutesForNextLevel / 60);

  return (
    <Card className="w-full max-w-md glass-card border-emerald/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <span className="flex items-center">
            <Timer className="mr-2" size={18} />
            {activeGoal ? `Focusing: ${activeGoal.title}` : "Focus Timer"}
          </span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activeGoal && (
            <div className="glass-card p-3 rounded border border-emerald/20 mb-2 text-sm">
              <div className="font-medium text-emerald-light mb-1">{activeGoal.title}</div>
              <div className="text-slate-400 text-xs">{activeGoal.description}</div>
            </div>
          )}
        
          <div className="flex items-center justify-between">
            <UserBadge level={userLevel} />
            <div className="text-xs text-slate-400">
              {earnedPoints.toFixed(1)}/{pointsForNextLevel} points
            </div>
          </div>
          
          <Progress value={progressPercent} className="h-2" />
          
          <div className="text-center">
            <div className={cn(
              "text-4xl font-mono my-4 transition-colors",
              isActive ? "text-emerald" : "text-slate-300"
            )}>
              {formatTime(time)}
            </div>
            <div className="text-xs text-slate-400">
              ~{hoursForNextLevel} hours of focus needed for next level
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between space-x-2">
        <Button
          variant="outline"
          onClick={resetTimer}
          className="w-full"
          disabled={time === 0}
        >
          Reset
        </Button>
        <Button
          variant={isActive ? "secondary" : "default"}
          onClick={toggleTimer}
          className="w-full"
        >
          {isActive ? (
            <><Pause className="mr-2" size={16} /> Pause</>
          ) : (
            <><Play className="mr-2" size={16} /> Start Focus</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
