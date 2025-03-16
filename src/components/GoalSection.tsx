
import React from "react";
import { Goal } from "./GoalRow";

interface GoalSectionProps {
  activeGoal: Goal | null | undefined;
}

const GoalSection: React.FC<GoalSectionProps> = ({ activeGoal }) => {
  if (!activeGoal) return null;
  
  return (
    <div className="glass-card p-3 rounded border border-emerald/20 mb-2 text-sm">
      <div className="font-medium text-emerald-light mb-1">{activeGoal.title}</div>
      <div className="text-slate-400 text-xs">{activeGoal.description}</div>
    </div>
  );
};

export default GoalSection;
