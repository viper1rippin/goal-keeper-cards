
import React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/timerUtils";

interface TimerDisplayProps {
  time: number;
  isActive: boolean;
  hoursForNextLevel: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  time, 
  isActive, 
  hoursForNextLevel 
}) => {
  return (
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
  );
};

export default TimerDisplay;
