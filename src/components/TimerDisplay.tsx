
import React from "react";
import { formatTime } from "@/utils/timerUtils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getCurrentBadge, getNextBadge, POINTS_FOR_LEVEL_UP } from "@/utils/badgeUtils";
import { Badge } from "./ui/badge";

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
  userLevel,
}) => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'User';
  
  // Get current and next badges
  const currentBadge = getCurrentBadge(userLevel);
  const nextBadge = getNextBadge(userLevel);
  const CurrentBadgeIcon = currentBadge.icon;
  
  // Calculate hours remaining for next level
  const hoursNeeded = Math.ceil(pointsForNextLevel / 60);
  
  return (
    <div className="space-y-6">
      {/* User info section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`rounded-full w-8 h-8 bg-gradient-to-r ${currentBadge.color} flex items-center justify-center text-xs font-bold`}>
            {userLevel}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-200 truncate max-w-[150px]">
              {username}
            </span>
            <Badge variant="outline" className="px-1.5 py-0 h-4 text-[10px] bg-transparent border-slate-600">
              <CurrentBadgeIcon className="h-2.5 w-2.5 mr-0.5" />
              {currentBadge.name}
            </Badge>
          </div>
        </div>
        <div className="text-right text-slate-400 text-sm">
          {earnedPoints.toFixed(1)}/{pointsForNextLevel} points
        </div>
      </div>
      
      {/* Timer display */}
      <div className="text-center">
        <div className={cn(
          "font-mono text-5xl tracking-widest",
          isActive ? "text-emerald" : "text-slate-200"
        )}>
          {formatTime(time)}
        </div>
        <div className="text-slate-400 text-sm mt-2">
          ~{hoursNeeded} hours of focus needed for next level
        </div>
        
        {nextBadge && (
          <div className="text-slate-400 text-xs mt-1">
            {`${nextBadge.name} badge at level ${nextBadge.level}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;
