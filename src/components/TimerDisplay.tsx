
import React from "react";
import { formatTime } from "@/utils/timerUtils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  
  // Calculate hours remaining for next level
  const hoursNeeded = Math.ceil(pointsForNextLevel / 60);
  
  return (
    <div className="space-y-6">
      {/* User info section - removed logout button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="rounded-full w-8 h-8 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-xs font-bold">
            {userLevel}
          </div>
          <span className="text-slate-200 truncate max-w-[150px]">
            {username}
          </span>
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
      </div>
    </div>
  );
};

export default TimerDisplay;
