
import { cn } from "@/lib/utils";

interface GoalCardProgressProps {
  progress: number;
  progressGradient: string;
  isActiveFocus: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

const GoalCardProgress = ({ 
  progress, 
  progressGradient, 
  isActiveFocus, 
  isFocused, 
  isHovered 
}: GoalCardProgressProps) => {
  return (
    <div className="mt-auto select-none">
      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-700 ease-out",
            isActiveFocus 
              ? `${progressGradient}` 
              : (isFocused || isHovered ? progressGradient : "from-emerald/40 to-emerald-light/40")
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GoalCardProgress;
