
import React from "react";
import { cn } from "@/lib/utils";
import { formatTime, calculateTimeForNextLevel } from "@/utils/timerUtils";
import { Progress } from "@/components/ui/progress";
import UserBadge from "./UserBadge";

interface TimerDisplayProps {
  time: number;
  isActive: boolean;
  earnedPoints: number;
  pointsForNextLevel: number;
  userLevel: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  isActive,
  earnedPoints,
  pointsForNextLevel,
  userLevel
}) => {
  // Calculate progress percentage
  const progressPercent = Math.min(
    100, 
    (earnedPoints / pointsForNextLevel) * 100
  );

  // Calculate time needed for next level (in hours)
  const hoursForNextLevel = calculateTimeForNextLevel(earnedPoints, pointsForNextLevel);

  return (
    <div className="space-y-4">
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
  );
};

export default TimerDisplay;
