
import { useState, useRef, useLayoutEffect } from "react";
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
  // Reference to track the last scroll position
  const lastScrollPosition = useRef(0);
  
  // Handle showing/hiding focus timer without scroll jumping
  useLayoutEffect(() => {
    if (showFocusTimer) {
      // When focus timer is shown, restore the previous scroll position
      setTimeout(() => {
        window.scrollTo({
          top: lastScrollPosition.current,
          behavior: "auto" // Use auto to avoid animation
        });
      }, 0);
    }
  }, [showFocusTimer]);
  
  const handleLevelUp = (newLevel: number) => {
    setUserLevel(newLevel);
  };
  
  // Handle timer toggle button click
  const handleTimerToggle = () => {
    // Save current scroll position before toggling
    lastScrollPosition.current = window.scrollY;
    setShowFocusTimer(!showFocusTimer);
  };
  
  return (
    <header className="w-full py-8 px-6 sm:px-8 md:px-12 lg:px-16 border-b border-slate-800/80">
      <AnimatedContainer animation="slide-up" className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">John's App</span>
            </h1>
            <p className="text-slate-400 mt-1">Set, track, and accomplish your goals</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              <UserBadge level={userLevel} />
              
              <div className="glass-card px-4 py-2 rounded-lg text-sm text-slate-300">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <Button 
              variant={activeGoal ? "default" : "outline"}
              size="sm"
              onClick={handleTimerToggle}
              className={cn(
                activeGoal 
                  ? "bg-emerald hover:bg-emerald-dark" 
                  : "border-emerald/20 hover:border-emerald/40"
              )}
            >
              <Timer className="mr-2" size={16} />
              {activeGoal ? "Focusing" : "Focus"}
            </Button>
          </div>
        </div>
        
        {showFocusTimer && (
          <div className="mt-6">
            <FocusTimer 
              userLevel={userLevel} 
              onLevelUp={handleLevelUp}
              onClose={() => {
                // Save current scroll position before closing timer
                lastScrollPosition.current = window.scrollY;
                setShowFocusTimer(false);
                if (onStopFocus) onStopFocus();
                
                // Restore scroll position after timer is removed
                setTimeout(() => {
                  window.scrollTo({
                    top: lastScrollPosition.current,
                    behavior: "auto"
                  });
                }, 0);
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
