
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";

export interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
}

const GoalCard = ({ title, description, progress, index }: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div className={cn(
        "glass-card rounded-lg p-5 h-full hover-scale",
        progress === 100 && "glass-card-emerald"
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
                className="h-full bg-gradient-to-r from-emerald to-emerald-light transition-all duration-700 ease-out"
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
