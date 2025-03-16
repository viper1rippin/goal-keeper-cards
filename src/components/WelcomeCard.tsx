
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";

interface WelcomeCardProps {
  onAddGoal: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onAddGoal }) => {
  return (
    <AnimatedContainer className="w-full mx-auto">
      <div className="glass-card p-4 rounded-lg border border-slate-800/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h2 className="text-lg font-medium text-slate-100">Welcome back, John</h2>
            <p className="text-sm text-slate-400">Track your progress and stay focused on your goals.</p>
          </div>
          <Button 
            onClick={onAddGoal}
            className="bg-emerald hover:bg-emerald-dark md:self-start whitespace-nowrap"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default WelcomeCard;
