
import { useState } from "react";
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Shield, 
  Award, 
  Sword, 
  Crown, 
  Medal, 
  Star, 
  Timer 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the badge levels
const badgeLevels = [
  { name: "Soldier", level: 10, icon: <Shield className="w-4 h-4" /> },
  { name: "Knight", level: 20, icon: <Sword className="w-4 h-4" /> },
  { name: "Elite Knight", level: 45, icon: <Sword className="w-4 h-4 text-emerald-400" /> },
  { name: "General", level: 70, icon: <Medal className="w-4 h-4" /> },
  { name: "Commander", level: 100, icon: <Star className="w-4 h-4" /> },
  { name: "King", level: 120, icon: <Crown className="w-4 h-4" /> },
  { name: "Emperor", level: 200, icon: <Award className="w-4 h-4 text-emerald-300" /> },
];

const Header = () => {
  const [userLevel, setUserLevel] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const { toast } = useToast();

  // Get current badge based on level
  const getCurrentBadge = () => {
    const currentBadge = badgeLevels.filter(badge => userLevel >= badge.level).pop() || badgeLevels[0];
    const badgeIndex = badgeLevels.findIndex(badge => badge.name === currentBadge.name);
    return { currentBadge, badgeIndex };
  };

  const { currentBadge, badgeIndex } = getCurrentBadge();
  const nextBadge = badgeLevels[badgeIndex + 1];
  const progressToNextLevel = nextBadge 
    ? Math.min(100, ((userLevel - currentBadge.level) / (nextBadge.level - currentBadge.level)) * 100) 
    : 100;

  const startFocusTimer = () => {
    if (isTimerActive) return;
    
    toast({
      title: "Johnomoto Focus Timer Started",
      description: "Your focus session has begun. Stay focused to earn points!",
    });
    
    setIsTimerActive(true);
    const interval = window.setInterval(() => {
      setFocusTime(prev => prev + 1);
      
      // Every hour (3600 seconds) of focus grants a level
      if (focusTime > 0 && focusTime % 3600 === 0) {
        const newLevel = userLevel + 1;
        setUserLevel(newLevel);
        
        // Check if user leveled up to a new badge
        badgeLevels.forEach(badge => {
          if (newLevel === badge.level) {
            toast({
              title: `Congratulations! New Badge Unlocked!`,
              description: `You've reached level ${badge.level} and earned the ${badge.name} badge!`,
            });
          }
        });
      }
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopFocusTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTimerActive(false);
    
    toast({
      title: "Focus Timer Stopped",
      description: `You focused for ${formatTime(focusTime)}. Keep up the good work!`,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-end sm:items-center">
            <div className="glass-card p-2 rounded-lg flex items-center space-x-2">
              <Badge variant="outline" className="bg-black/40 border-emerald/40 flex gap-1 items-center">
                {currentBadge.icon}
                <span>{currentBadge.name}</span>
              </Badge>
              <span className="text-xs text-slate-300">Level {userLevel}</span>
              {nextBadge && (
                <span className="text-xs text-slate-400">
                  Next: {nextBadge.name} ({nextBadge.level - userLevel} to go)
                </span>
              )}
            </div>
            
            <div className="glass-card p-2 rounded-lg flex items-center space-x-2">
              {isTimerActive ? (
                <>
                  <span className="text-sm font-medium text-emerald-400">{formatTime(focusTime)}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 border-emerald/20 hover:bg-emerald/20"
                    onClick={stopFocusTimer}
                  >
                    Stop Focus
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 border-emerald/20 hover:bg-emerald/20"
                  onClick={startFocusTimer}
                >
                  <Timer className="mr-1 h-4 w-4" />
                  Johnomoto Focus
                </Button>
              )}
            </div>
          </div>
        </div>
      </AnimatedContainer>
    </header>
  );
};

export default Header;
