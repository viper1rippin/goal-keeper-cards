
import React from "react";
import { SubGoal } from "@/types/goal-types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GoalSectionProps {
  activeGoal: SubGoal | null | undefined;
}

const GoalSection: React.FC<GoalSectionProps> = ({ activeGoal }) => {
  if (!activeGoal) return null;
  
  return (
    <div className="glass-card-emerald p-3 rounded border border-emerald/15 mb-2 text-sm relative overflow-hidden">
      {/* Subtle depth enhancer - very low opacity to create dimension without distraction */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 70%, rgba(0,0,0,0.05) 100%)',
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
