
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";

interface WelcomeCardProps {
  onAddGoal: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onAddGoal }) => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto mb-12">
      <div className="glass-card p-6 rounded-lg border border-slate-800/80 mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium mb-1">Welcome back, John</h2>
            <p className="text-slate-400">Track your progress and stay focused on your goals.</p>
          </div>
          <Button 
            onClick={onAddGoal}
            className="bg-emerald hover:bg-emerald-dark"
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
