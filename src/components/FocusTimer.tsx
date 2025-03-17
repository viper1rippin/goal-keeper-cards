
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Glass } from "./Glass";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import { useTimer } from "@/hooks/useTimer";
import { Goal } from "./GoalRow";

interface FocusTimerProps {
  activeGoal?: Goal | null;
}

export default function FocusTimer({ activeGoal }: FocusTimerProps) {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(1);
  
  useEffect(() => {
    if (user) {
      const fetchUserLevel = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('level, points')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user level:', error);
          return;
        }
        
        if (data) {
          setUserLevel(data.level || 1);
        }
      };
      
      fetchUserLevel();
    }
  }, [user]);
  
  const { 
    isActive, 
    time, 
    earnedPoints, 
    pointsForNextLevel,
    toggleTimer, 
    resetTimer 
  } = useTimer({
    userLevel,
    onLevelUp: (newLevel) => {
      setUserLevel(newLevel);
    },
    activeGoal,
    userId: user?.id
  });

  return (
    <Glass className="p-6 sm:p-8 h-full">
      <TimerDisplay 
        time={time}
        isActive={isActive}
        earnedPoints={earnedPoints}
        pointsForNextLevel={pointsForNextLevel}
        userLevel={userLevel}
      />
      <TimerControls 
        isActive={isActive}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        hasActiveGoal={!!activeGoal}
      />
    </Glass>
  );
}
