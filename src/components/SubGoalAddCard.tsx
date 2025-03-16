
import { Plus } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";
import { cn } from "@/lib/utils";

interface SubGoalAddCardProps {
  onClick: () => void;
  index: number;
}

const SubGoalAddCard = ({ onClick, index }: SubGoalAddCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + (index + 1) * 50;

  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div 
        onClick={onClick}
        className={cn(
          "glass-card rounded-lg p-5 h-full transition-all duration-300 relative overflow-hidden",
          "bg-slate-900/40 border-slate-800/30 opacity-70 hover:opacity-100 hover:bg-slate-900/50 hover:border-emerald/10 cursor-pointer"
        )}
      >
        <div className="absolute inset-0 border border-dashed border-slate-700/50 rounded-lg m-1 pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center">
          <div className="rounded-full bg-gradient-to-br from-emerald-dark/30 to-emerald/5 p-3 mb-4 relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald/40 to-emerald-dark/10 blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            <Plus className="h-8 w-8 text-emerald/80 relative z-10 group-hover:text-emerald-light transition-colors duration-300" />
          </div>
          <p className="text-slate-400 text-sm">Add Sub-Goal</p>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default SubGoalAddCard;
