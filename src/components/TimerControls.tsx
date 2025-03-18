
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, TimerReset } from "lucide-react";

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
        <TimerReset className="mr-2" size={16} />
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
          <>
            <Play className="mr-2" size={16} /> 
            {time > 0 ? "Resume" : "Start Focus"}
          </>
        )}
      </Button>
    </div>
  );
};

export default TimerControls;
