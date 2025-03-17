
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Timer } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";
import { useAuth } from "@/context/AuthContext";

interface WelcomeCardProps {
  onAddGoal: () => void;
  onToggleFocusTimer?: () => void;
  showFocusTimer?: boolean;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onAddGoal, onToggleFocusTimer, showFocusTimer }) => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Guest';
  
  return (
    <AnimatedContainer className="max-w-7xl mx-auto mb-12">
      <div className="glass-card p-6 rounded-lg border border-slate-800/80 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="text-gradient">Become a Billionaire</span>
            </h1>
            <p className="text-slate-400">Welcome back, {username}. Track your progress and stay focused on your goals.</p>
          </div>
          <div className="flex items-center space-x-3 self-end md:self-auto">
            {user && (
              <Button 
                variant={showFocusTimer ? "default" : "outline"}
                onClick={onToggleFocusTimer}
                className={`${showFocusTimer ? "bg-emerald hover:bg-emerald-dark" : "border-emerald/20 hover:border-emerald/40"}`}
              >
                <Timer className="mr-2" size={16} />
                {showFocusTimer ? "Focusing" : "Focus"}
              </Button>
            )}
            <Button 
              onClick={onAddGoal}
              className="bg-emerald hover:bg-emerald-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default WelcomeCard;
