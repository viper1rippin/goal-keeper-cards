
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo } from "react";

export interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
}

// Define gradient variations for emerald tones for progress bars
const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-dark to-emerald",
  "from-teal-500 to-emerald-400",
  "from-green-400 to-emerald-500",
  "from-emerald-300 to-teal-600",
  "from-emerald-400 to-green-300",
  "from-teal-400 to-emerald-300",
  "from-emerald-500 to-teal-300",
];

// Define card background gradient variations
const cardGradientVariations = [
  "from-emerald/10 to-emerald-dark/20",
  "from-emerald-dark/15 to-emerald/10",
  "from-teal-500/10 to-emerald-400/15",
  "from-green-400/10 to-emerald-500/15",
  "from-emerald-300/10 to-teal-600/20",
  "from-emerald-400/10 to-green-300/15",
  "from-teal-400/15 to-emerald-300/10",
  "from-emerald-500/15 to-teal-300/10",
];

const GoalCard = ({ title, description, progress, index }: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  
  // Select consistent gradients based on the title
  const gradients = useMemo(() => {
    // Use the sum of character codes from the title to create a deterministic but seemingly random choice
    const titleSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const progressGradientIndex = titleSum % progressGradientVariations.length;
    const cardGradientIndex = (titleSum + 3) % cardGradientVariations.length; // Offset to get different gradient
    
    return {
      progressGradient: progressGradientVariations[progressGradientIndex],
      cardGradient: cardGradientVariations[cardGradientIndex]
    };
  }, [title]);
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div className={cn(
        "rounded-lg p-5 h-full hover-scale bg-gradient-to-br border border-slate-800/80 shadow-lg",
        gradients.cardGradient,
        progress === 100 ? "glass-card-emerald" : "from-apple-light to-apple-dark backdrop-blur-sm"
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
                className={`h-full bg-gradient-to-r ${gradients.progressGradient} transition-all duration-700 ease-out`}
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
