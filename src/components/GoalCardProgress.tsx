
import { cn } from "@/lib/utils";

interface GoalCardProgressProps {
  progress: number;
  progressGradient: string;
  isActiveFocus: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isLightMode?: boolean;
}

const GoalCardProgress = ({ 
  progress, 
  progressGradient,
  isActiveFocus, 
  isFocused, 
  isHovered,
  isLightMode = false
}: GoalCardProgressProps) => {
  return (
    <div className="relative h-4 mt-auto">
      <div className={cn(
        "w-full h-2 rounded-full overflow-hidden",
        isLightMode 
          ? "bg-slate-200" 
          : (isActiveFocus || isFocused || isHovered) ? "bg-slate-800" : "bg-apple"
      )}>
        <div
          className={cn(
            "h-full rounded-full", 
            isLightMode 
              ? "bg-gradient-to-r from-ocean to-ocean-light"
              : `bg-gradient-to-r ${progressGradient}`
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={cn(
        "absolute right-0 -top-0 text-xs font-medium",
        isLightMode
          ? "text-slate-700"
          : (isActiveFocus || isFocused || isHovered) ? "text-slate-300" : "text-slate-500"
      )}>
        {progress}%
      </span>
    </div>
  );
};

export default GoalCardProgress;
