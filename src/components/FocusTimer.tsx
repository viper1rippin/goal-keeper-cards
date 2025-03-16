
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, X } from "lucide-react";
import UserBadge from "./UserBadge";
import { Goal } from "./GoalRow";
import ActiveGoalCard from "./focus/ActiveGoalCard";
import TimerDisplay from "./focus/TimerDisplay";
import TimerControls from "./focus/TimerControls";
import { useTimer } from "@/hooks/useTimer";
import { getPointsForNextLevel, calculateTimeForNextLevel } from "@/utils/timerUtils";

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
  const { isActive, time, earnedPoints, toggleTimer, resetTimer } = useTimer({
    userLevel,
    onLevelUp,
    activeGoal
  });

  const pointsForNextLevel = getPointsForNextLevel(userLevel);
  
  // Calculate progress percentage
  const progressPercent = Math.min(
    100, 
    (earnedPoints / pointsForNextLevel) * 100
  );

  // Calculate time needed for next level
  const hoursForNextLevel = calculateTimeForNextLevel(earnedPoints, pointsForNextLevel);

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
          {activeGoal && <ActiveGoalCard activeGoal={activeGoal} />}
        
          <div className="flex items-center justify-between">
            <UserBadge level={userLevel} />
            <div className="text-xs text-slate-400">
              {earnedPoints.toFixed(1)}/{pointsForNextLevel} points
            </div>
          </div>
          
          <Progress value={progressPercent} className="h-2" />
          
          <TimerDisplay 
            time={time} 
            isActive={isActive} 
            hoursForNextLevel={hoursForNextLevel} 
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <TimerControls 
          isActive={isActive} 
          time={time} 
          toggleTimer={toggleTimer} 
          resetTimer={resetTimer} 
        />
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
