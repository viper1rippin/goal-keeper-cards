
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from "./GoalRow";
import { useTimer } from "@/hooks/useTimer";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import GoalSection from "./GoalSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParentGoal } from "./index/IndexPageTypes";

interface FocusTimerProps {
  userLevel: number;
  onLevelUp: (newLevel: number) => void;
  onClose: () => void;
  activeGoal?: Goal | null;
  parentGoals?: ParentGoal[];
  onGoalSelect?: (goal: Goal) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  userLevel, 
  onLevelUp,
  onClose,
  activeGoal,
  parentGoals = [],
  onGoalSelect
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(activeGoal || null);

  // Update selected goal when activeGoal changes
  useEffect(() => {
    if (activeGoal) {
      setSelectedGoal(activeGoal);
    }
  }, [activeGoal]);

  const {
    isActive,
    time,
    earnedPoints,
    pointsForNextLevel,
    toggleTimer,
    resetTimer
  } = useTimer({ userLevel, onLevelUp, activeGoal: selectedGoal });

  // Handle goal selection from dropdown
  const handleGoalSelect = (goalId: string) => {
    // First check if it's a parent goal's direct ID (though these don't have focus functionality)
    let found = false;
    
    // Then look through all subgoals to find the match
    for (const parent of parentGoals) {
      for (const subgoal of parent.goals) {
        if (subgoal.id === goalId) {
          setSelectedGoal(subgoal);
          if (onGoalSelect) onGoalSelect(subgoal);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  };

  // Get all available goals for the dropdown
  const getAllGoals = () => {
    let allGoals: { id: string; title: string; parentTitle: string }[] = [];
    
    parentGoals.forEach(parent => {
      parent.goals.forEach(goal => {
        allGoals.push({
          id: goal.id,
          title: goal.title,
          parentTitle: parent.title
        });
      });
    });
    
    return allGoals;
  };

  return (
    <Card className="w-full max-w-md glass-card border-emerald/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <span className="flex items-center">
            <Timer className="mr-2" size={18} />
            Focus Timer
          </span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Goal selector dropdown */}
          <div className="mb-4">
            <Select
              value={selectedGoal?.id}
              onValueChange={handleGoalSelect}
            >
              <SelectTrigger className="w-full bg-slate-800/60 border-slate-700/50 backdrop-blur-sm text-white">
                <SelectValue placeholder={selectedGoal ? selectedGoal.title : "Select a goal to focus on"} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 text-white">
                {getAllGoals().map(goal => (
                  <SelectItem 
                    key={goal.id} 
                    value={goal.id}
                    className="text-white focus:bg-emerald/20 focus:text-white"
                  >
                    <div className="flex flex-col">
                      <span>{goal.title}</span>
                      <span className="text-xs text-slate-400">from {goal.parentTitle}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <GoalSection activeGoal={selectedGoal} />
          
          <TimerDisplay 
            time={time}
            isActive={isActive}
            earnedPoints={earnedPoints}
            pointsForNextLevel={pointsForNextLevel}
            userLevel={userLevel}
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <TimerControls 
          isActive={isActive}
          time={time}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
        />
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
