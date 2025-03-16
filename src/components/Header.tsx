
import { useState } from "react";
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import UserBadge from "./UserBadge";
import { Button } from "./ui/button";
import { Timer } from "lucide-react";
import FocusTimer from "./FocusTimer";
import { Goal } from "./GoalRow";

interface HeaderProps {
  activeGoal?: Goal | null;
  showFocusTimer: boolean;
  setShowFocusTimer: (show: boolean) => void;
  onStopFocus?: () => void;
}

const Header = ({ 
  activeGoal,
  showFocusTimer,
  setShowFocusTimer,
  onStopFocus
}: HeaderProps) => {
  const [userLevel, setUserLevel] = useState(10); // Default starting level
  
  const handleLevelUp = (newLevel: number) => {
    setUserLevel(newLevel);
  };
  
  return (
    <header className="w-full py-4 px-6 sm:px-8 md:px-12 lg:px-16 border-b border-slate-800/60">
      <AnimatedContainer animation="slide-up" className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-gradient">John's App</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Set, track, and accomplish your goals</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-3">
              <UserBadge level={userLevel} />
              
              <div className="glass-card px-3 py-1.5 rounded-lg text-xs text-slate-300">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            <Button 
              variant={activeGoal ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFocusTimer(!showFocusTimer)}
              className={cn(
                activeGoal 
                  ? "bg-emerald hover:bg-emerald-dark" 
                  : "border-emerald/20 hover:border-emerald/40"
              )}
            >
              <Timer className="mr-1.5" size={14} />
              {activeGoal ? "Focusing" : "Focus"}
            </Button>
          </div>
        </div>
        
        {showFocusTimer && (
          <div className="mt-4">
            <FocusTimer 
              userLevel={userLevel} 
              onLevelUp={handleLevelUp}
              onClose={() => {
                setShowFocusTimer(false);
                if (onStopFocus) onStopFocus();
              }}
              activeGoal={activeGoal}
            />
          </div>
        )}
      </AnimatedContainer>
    </header>
  );
};

export default Header;
