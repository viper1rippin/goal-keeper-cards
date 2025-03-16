
import { useState } from "react";
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import UserBadge from "./UserBadge";
import { Button } from "./ui/button";
import { Timer } from "lucide-react";
import FocusTimer from "./FocusTimer";

interface HeaderProps {
  onStartFocusTimer?: (goalTitle: string, goalDescription: string) => void;
}

const Header = ({ onStartFocusTimer }: HeaderProps) => {
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [userLevel, setUserLevel] = useState(10); // Default starting level
  const [focusedGoal, setFocusedGoal] = useState<{ title?: string; description?: string }>({});
  
  const handleLevelUp = (newLevel: number) => {
    setUserLevel(newLevel);
  };
  
  const handleStartFocusTimer = (goalTitle: string, goalDescription: string) => {
    setFocusedGoal({ title: goalTitle, description: goalDescription });
    setShowFocusTimer(true);
  };
  
  // Expose the handler to parent components
  if (onStartFocusTimer) {
    onStartFocusTimer = handleStartFocusTimer;
  }
  
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
              variant="outline" 
              size="sm"
              onClick={() => setShowFocusTimer(!showFocusTimer)}
              className="border-emerald/20 hover:border-emerald/40"
            >
              <Timer className="mr-2" size={16} />
              Focus
            </Button>
          </div>
        </div>
        
        {showFocusTimer && (
          <div className="mt-6">
            <FocusTimer 
              userLevel={userLevel} 
              onLevelUp={handleLevelUp}
              onClose={() => setShowFocusTimer(false)}
              goalTitle={focusedGoal.title}
              goalDescription={focusedGoal.description}
            />
          </div>
        )}
      </AnimatedContainer>
    </header>
  );
};

export default Header;
