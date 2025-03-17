
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <div className="mt-auto">
      <div className="flex justify-between text-xs mb-1.5">
        <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Progress</span>
        <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>{progress}%</span>
      </div>
      <div className={cn(
        "h-1.5 rounded-full overflow-hidden",
        isDarkMode ? "bg-slate-800" : "bg-slate-200"
      )}>
        <div 
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-700 ease-out",
            isActiveFocus 
              ? `${progressGradient}` 
              : (isFocused || isHovered) 
                ? progressGradient 
                : isDarkMode 
                  ? "from-emerald/40 to-emerald-light/40" 
                  : "from-emerald/60 to-emerald-light/60"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GoalCardProgress;
