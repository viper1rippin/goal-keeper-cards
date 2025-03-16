
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface TimerControlsProps {
  isActive: boolean;
  time: number;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  time,
  toggleTimer,
  resetTimer
}) => {
  return (
    <div className="flex justify-between space-x-2">
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
          <div className="flex items-center">
            <Pause className="mr-2" size={16} /> Pause
          </div>
        ) : (
          <div className="flex items-center">
            <Play className="mr-2" size={16} /> 
            {time > 0 ? "Resume Focus" : "Start Focus"}
          </div>
        )}
      </Button>
    </div>
  );
};

export default TimerControls;
