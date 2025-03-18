
import React from "react";
import { formatTime, pointsToHours } from "@/utils/timerUtils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getCurrentBadge, getNextBadge, POINTS_FOR_LEVEL_UP } from "@/utils/badgeUtils";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "./ui/button";

interface TimerDisplayProps {
  time: number;
  isActive: boolean;
  earnedPoints: number;
  pointsForNextLevel: number;
  userLevel: number;
  isGuestMode?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  isActive,
  earnedPoints,
  pointsForNextLevel,
  userLevel,
  isGuestMode = false
}) => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Guest';
  
  // Get current and next badges
  const currentBadge = getCurrentBadge(userLevel);
  const nextBadge = getNextBadge(userLevel);
  const CurrentBadgeIcon = currentBadge.icon;
  
  // Calculate hours needed for next level
  const hoursCompleted = pointsToHours(earnedPoints);
  const hoursNeeded = pointsToHours(pointsForNextLevel);
  const hoursRemaining = Math.max(0, hoursNeeded - hoursCompleted);
  
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
        {isGuestMode ? (
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link to="/login">
              <LogIn className="h-3 w-3 mr-1" />
              Login to track progress
            </Link>
          </Button>
        ) : (
          <div className="text-right text-slate-400 text-sm">
            {hoursCompleted.toFixed(1)}/{hoursNeeded} hours
          </div>
        )}
      </div>
      
      {/* Timer display */}
      <div className="text-center">
        <div className={cn(
          "font-mono text-5xl tracking-widest",
          isActive ? "text-emerald" : "text-slate-200"
        )}>
          {formatTime(time)}
        </div>
        
        {isGuestMode ? (
          <div className="text-slate-400 text-sm mt-2">
            Sign up to track your focus progress
          </div>
        ) : (
          <>
            <div className="text-slate-400 text-sm mt-2">
              ~{hoursRemaining} hours of focus needed for next level
            </div>
            
            {nextBadge && (
              <div className="text-slate-400 text-xs mt-1">
                {`${nextBadge.name} badge at level ${nextBadge.level}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;
