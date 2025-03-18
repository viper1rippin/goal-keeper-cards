
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { Button } from "./ui/button";
import { Timer, LogIn, UserPlus } from "lucide-react";
import FocusTimer from "./FocusTimer";
import { Goal } from "./GoalRow";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  activeGoal?: Goal | null;
  showFocusTimer: boolean;
  setShowFocusTimer: (show: boolean) => void;
  onStopFocus?: () => void;
  hideAuthButtons?: boolean;
}

const Header = ({ 
  activeGoal,
  showFocusTimer,
  setShowFocusTimer,
  onStopFocus,
  hideAuthButtons = false
}: HeaderProps) => {
  const [userLevel, setUserLevel] = useState(1); // Start at level 1 (Peasant)
  const { user } = useAuth();
  // Reference to track the last scroll position
  const lastScrollPosition = useRef(0);
  
  // Fetch the user's level on mount
  useEffect(() => {
    if (user) {
      const fetchUserLevel = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('level')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data && data.level) {
          setUserLevel(data.level);
        }
      };
      
      fetchUserLevel();
      
      // Subscribe to level changes
      const channel = supabase
        .channel('header-level-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && payload.new.level) {
              setUserLevel(payload.new.level);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
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
  
  // Only update level if user is authenticated
  const handleLevelUp = (newLevel: number) => {
    if (user) {
      setUserLevel(newLevel);
    }
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
              <span className="text-gradient">Loyde</span>
            </h1>
            <p className="text-slate-400 mt-1">Set, track, and accomplish your goals</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              <div className="glass-card px-4 py-2 rounded-lg text-sm text-slate-300">
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <Button 
              variant={showFocusTimer ? "default" : "outline"}
              size="sm"
              onClick={handleTimerToggle}
              className={cn(
                showFocusTimer 
                  ? "bg-emerald hover:bg-emerald-dark" 
                  : "border-emerald/20 hover:border-emerald/40"
              )}
            >
              <Timer className="mr-2" size={16} />
              {showFocusTimer ? "Focusing" : "Focus"}
            </Button>
            
            {!user && !hideAuthButtons && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="mr-2" size={16} />
                    Log In
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald hover:bg-emerald-dark"
                  asChild
                >
                  <Link to="/signup">
                    <UserPlus className="mr-2" size={16} />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
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
              isGuestMode={!user}
            />
          </div>
        )}
      </AnimatedContainer>
    </header>
  );
};

export default Header;
