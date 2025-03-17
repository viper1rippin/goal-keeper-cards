
import { cn } from "@/lib/utils";
import GoalCardProgress from "./GoalCardProgress";
import { useTheme } from "@/context/ThemeContext";

interface GoalCardContentProps {
  title: string;
  description: string;
  progress: number;
  progressGradient: string;
  isActiveFocus: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

const GoalCardContent = ({ 
  title, 
  description, 
  progress, 
  progressGradient,
  isActiveFocus, 
  isFocused, 
  isHovered 
}: GoalCardContentProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <div className="flex flex-col h-full relative z-2 pt-4">
      <h3 className={cn(
        "font-medium text-lg mb-2",
        isActiveFocus 
          ? isDarkMode ? "text-white" : "text-slate-900"
          : (isFocused || isHovered) 
            ? isDarkMode ? "text-slate-100" : "text-slate-800" 
            : isDarkMode ? "text-slate-400" : "text-slate-600"
      )}>{title}</h3>
      <p className={cn(
        "text-sm flex-1 mb-4",
        isActiveFocus 
          ? isDarkMode ? "text-slate-200" : "text-slate-700"
          : (isFocused || isHovered) 
            ? isDarkMode ? "text-slate-300" : "text-slate-600" 
            : isDarkMode ? "text-slate-500" : "text-slate-500"
      )}>{description}</p>
      
      <GoalCardProgress 
        progress={progress}
        progressGradient={progressGradient}
        isActiveFocus={isActiveFocus}
        isFocused={isFocused}
        isHovered={isHovered}
      />
    </div>
  );
};

export default GoalCardContent;
