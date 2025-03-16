
import React from "react";
import { Goal } from "./GoalRow";
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";

interface GoalSectionProps {
  activeGoal: Goal | null | undefined;
}

const GoalSection: React.FC<GoalSectionProps> = ({ activeGoal }) => {
  if (!activeGoal) return null;
  
  return (
    <AnimatedContainer 
      animation="scale-in" 
      className="w-full"
    >
      <div className="glass-card-emerald p-4 rounded-lg border border-emerald/30 mb-3 text-sm relative overflow-hidden shadow-lg shadow-emerald/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark/20 to-emerald/5 opacity-70"></div>
        <div className="relative z-10">
          <div className="font-medium text-emerald-light mb-2 text-gradient">{activeGoal.title}</div>
          <div className="text-slate-300 text-xs">{activeGoal.description}</div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-emerald/5 blur-xl"></div>
      </div>
    </AnimatedContainer>
  );
};

export default GoalSection;
