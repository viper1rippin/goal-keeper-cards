
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from "./GoalRow";
import { useTimer } from "@/hooks/useTimer";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import GoalSection from "./GoalSection";

interface FocusTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  onClose: () => void;
  activeGoal?: Goal | null;
  isGuestMode?: boolean;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  userLevel, 
  onLevelUp,
  onClose,
  activeGoal,
  isGuestMode = false
}) => {
  const {
    isActive,
    time,
    earnedPoints,
    pointsForNextLevel,
    toggleTimer,
    resetTimer
  } = useTimer({ userLevel, onLevelUp, activeGoal });

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
          <GoalSection activeGoal={activeGoal} />
          
          <TimerDisplay 
            time={time}
            isActive={isActive}
            earnedPoints={earnedPoints}
            pointsForNextLevel={pointsForNextLevel}
            userLevel={userLevel}
            isGuestMode={isGuestMode}
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
