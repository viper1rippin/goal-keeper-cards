
import React from "react";
import WelcomeCard from "@/components/WelcomeCard";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import GoalsList from "@/components/GoalsList";
import LoadingGoals from "@/components/LoadingGoals";
import { useIndexPage } from "./IndexPageContext";
import FocusTimer from "@/components/FocusTimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const GoalsContent: React.FC = () => {
  const { 
    parentGoals, 
    isLoading, 
    activeGoalIndices,
    handleGoalFocus, 
    handleCreateOrEditGoal, 
    handleUpdateSubGoals,
    handleDragEnd,
    deleteParentGoal,
    deleteSubGoal,
    activeGoal,
    showFocusTimer,
    setShowFocusTimer,
    handleStopFocus
  } = useIndexPage();

  const [userLevel, setUserLevel] = React.useState(1);
  const { user } = useAuth();
  
  React.useEffect(() => {
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
        .channel('goals-level-updates')
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
  
  // Only update level if user is authenticated
  const handleLevelUp = (newLevel: number) => {
    if (user) {
      setUserLevel(newLevel);
    } else {
      // For guest users, show a message encouraging signup
      console.log("Guest users can't accumulate progress. Sign up to track your progress!");
    }
  };

  return (
    <main className="w-full max-w-5xl pt-8 px-4 sm:px-6 md:px-8">
      <WelcomeCard 
        onAddGoal={() => handleCreateOrEditGoal(null)} 
        onToggleFocusTimer={() => setShowFocusTimer(!showFocusTimer)}
        showFocusTimer={showFocusTimer}
      />
      
      {showFocusTimer && (
        <div className="mb-8">
          <FocusTimer 
            userLevel={userLevel} 
            onLevelUp={handleLevelUp}
            onClose={() => {
              setShowFocusTimer(false);
              if (handleStopFocus) handleStopFocus();
            }}
            activeGoal={activeGoal}
            isGuestMode={!user}
          />
        </div>
      )}
      
      {isLoading ? (
        <LoadingGoals />
      ) : parentGoals.length === 0 ? (
        <EmptyGoalsList onCreateGoal={() => handleCreateOrEditGoal(null)} />
      ) : (
        <GoalsList 
          parentGoals={parentGoals}
          activeGoalIndices={activeGoalIndices}
          onGoalFocus={handleGoalFocus}
          onUpdateSubGoals={handleUpdateSubGoals}
          onEditGoal={handleCreateOrEditGoal}
          onDragEnd={handleDragEnd}
          onDeleteParentGoal={deleteParentGoal}
          onDeleteSubGoal={deleteSubGoal}
        />
      )}
    </main>
  );
};

export default GoalsContent;
