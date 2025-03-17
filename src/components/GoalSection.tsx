
import React from "react";
import { Goal } from "./GoalRow";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface GoalSectionProps {
  activeGoal: Goal | null | undefined;
}

const GoalSection: React.FC<GoalSectionProps> = ({ activeGoal }) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  
  if (!activeGoal) return null;
  
  return (
    <div className={cn(
      isLightMode 
        ? "bg-gradient-to-br from-gold-light/30 to-ocean-light/20 border-gold/20 p-3 rounded shadow-sm animate-gold-sparkle"
        : "glass-card-emerald p-3 rounded border border-emerald/15",
      "mb-2 text-sm relative overflow-hidden"
    )}>
      {/* Subtle depth enhancer - very low opacity to create dimension without distraction */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLightMode
            ? 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 70%, rgba(14,165,233,0.05) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 70%, rgba(0,0,0,0.05) 100%)',
          zIndex: 0,
          opacity: isLightMode ? 0.7 : 0.5
        }}
      />
      
      <div className="relative z-1">
        <div className={cn(
          "font-medium mb-1",
          isLightMode ? "text-slate-800" : "text-emerald-light"
        )}>
          {activeGoal.title}
        </div>
        <div className={cn(
          "text-xs",
          isLightMode ? "text-slate-700" : "text-slate-400"
        )}>
          {activeGoal.description}
        </div>
      </div>
    </div>
  );
};

export default GoalSection;
