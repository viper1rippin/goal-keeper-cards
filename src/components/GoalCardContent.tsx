
import { cn } from "@/lib/utils";
import GoalCardProgress from "./GoalCardProgress";

interface GoalCardContentProps {
  title: string;
  description: string;
  progress: number;
  progressGradient: string;
  isActiveFocus: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isLightMode?: boolean;
}

const GoalCardContent = ({ 
  title, 
  description, 
  progress, 
  progressGradient,
  isActiveFocus, 
  isFocused, 
  isHovered,
  isLightMode = false
}: GoalCardContentProps) => {
  return (
    <div className="flex flex-col h-full relative z-2 pt-4">
      <h3 className={cn(
        "font-medium text-lg mb-2",
        isLightMode
          ? (isActiveFocus || isFocused || isHovered)
            ? "text-slate-800" 
            : "text-slate-700"
          : isActiveFocus 
            ? "text-white" 
            : (isFocused || isHovered ? "text-slate-100" : "text-slate-400")
      )}>{title}</h3>
      <p className={cn(
        "text-sm flex-1 mb-4",
        isLightMode
          ? (isActiveFocus || isFocused || isHovered)
            ? "text-slate-700" 
            : "text-slate-600"
          : isActiveFocus 
            ? "text-slate-200" 
            : (isFocused || isHovered ? "text-slate-300" : "text-slate-500")
      )}>{description}</p>
      
      <GoalCardProgress 
        progress={progress}
        progressGradient={progressGradient}
        isActiveFocus={isActiveFocus}
        isFocused={isFocused}
        isHovered={isHovered}
        isLightMode={isLightMode}
      />
    </div>
  );
};

export default GoalCardContent;
