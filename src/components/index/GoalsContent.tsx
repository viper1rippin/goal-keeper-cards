
import React from "react";
import WelcomeCard from "@/components/WelcomeCard";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import GoalsList from "@/components/GoalsList";
import LoadingGoals from "@/components/LoadingGoals";
import { useIndexPage } from "./IndexPageContext";
import FocusTimer from "@/components/FocusTimer";

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

  const [userLevel, setUserLevel] = React.useState(10);
  
  const handleLevelUp = (newLevel: number) => {
    setUserLevel(newLevel);
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
