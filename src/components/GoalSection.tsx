
import React from "react";
import { Goal } from "./GoalRow";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GoalSectionProps {
  activeGoal: Goal | null | undefined;
}

const GoalSection: React.FC<GoalSectionProps> = ({ activeGoal }) => {
  if (!activeGoal) return null;
  
  return (
    <div className="glass-card-emerald p-3 rounded border border-emerald/20 mb-2 text-sm relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />
      
      <div className="relative z-1">
        <div className="font-medium text-emerald-light mb-1">{activeGoal.title}</div>
        <div className="text-slate-400 text-xs">{activeGoal.description}</div>
      </div>
    </div>
  );
};

export default GoalSection;
