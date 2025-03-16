
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo } from "react";

export interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
}

// Collection of emerald-toned gradients for cards
const gradientVariations = [
  "from-emerald-dark/20 to-apple-dark",
  "from-emerald-dark/30 to-emerald/5",
  "from-emerald/10 to-apple-dark",
  "from-emerald-light/10 to-apple-dark",
  "from-emerald/5 to-emerald-dark/20",
  "from-emerald-dark/25 to-emerald/10",
];

// Collection of progress bar gradients
const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-light to-emerald",
  "from-emerald-dark to-emerald",
  "from-emerald to-emerald-dark",
  "from-emerald-light/90 to-emerald",
  "from-emerald/90 to-emerald-light",
];

const GoalCard = ({ title, description, progress, index, isFocused, onFocus }: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  
  // Generate a consistent gradient for each card based on the title
  const cardGradient = useMemo(() => {
    // Use the title to create a deterministic but seemingly random index
    const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charSum % gradientVariations.length;
    return gradientVariations[gradientIndex];
  }, [title]);
  
  // Generate a consistent gradient for each progress bar based on the title
  const progressGradient = useMemo(() => {
    const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charSum % progressGradientVariations.length;
    return progressGradientVariations[gradientIndex];
  }, [title]);
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div 
        className={cn(
          "glass-card rounded-lg p-5 h-full hover-scale transition-all duration-300",
          isFocused 
            ? `bg-gradient-to-br ${cardGradient} border-emerald/20 shadow-lg shadow-emerald/10` 
            : "bg-slate-900/70 border-slate-800/50 opacity-70 hover:opacity-90",
          progress === 100 && !isFocused && "border-emerald/10"
        )}
        onClick={onFocus}
      >
        <div className="flex flex-col h-full">
          <h3 className={cn(
            "font-medium text-lg mb-2",
            isFocused ? "text-slate-100" : "text-slate-400"
          )}>{title}</h3>
          <p className={cn(
            "text-sm flex-1 mb-4",
            isFocused ? "text-slate-300" : "text-slate-500"
          )}>{description}</p>
          
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-700 ease-out",
                  isFocused ? progressGradient : "from-emerald/40 to-emerald-light/40"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default GoalCard;
