
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo } from "react";

export interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
}

// Define a set of emerald-toned gradient variations
const gradientVariations = [
  "from-emerald-400 to-emerald-600",
  "from-emerald-300 to-emerald-700",
  "from-emerald-500 to-teal-700",
  "from-teal-400 to-emerald-600",
  "from-green-400 to-emerald-600",
  "from-emerald-400 to-green-700",
  "from-emerald-300 to-teal-600",
  "from-teal-300 to-emerald-500",
];

const GoalCard = ({ title, description, progress, index }: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  
  // Generate a deterministic but seemingly random gradient for each card based on title and index
  const gradientClass = useMemo(() => {
    // Create a simple hash from the title and index to ensure the same card always gets the same gradient
    const hashCode = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
    const gradientIndex = hashCode % gradientVariations.length;
    return gradientVariations[gradientIndex];
  }, [title, index]);
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div className={cn(
        "glass-card rounded-lg p-5 h-full hover-scale",
        progress === 100 ? "glass-card-emerald" : ""
      )}>
        <div className="flex flex-col h-full">
          <h3 className="font-medium text-lg mb-2">{title}</h3>
          <p className="text-slate-400 text-sm flex-1 mb-4">{description}</p>
          
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-700 ease-out bg-gradient-to-r",
                  gradientClass
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
