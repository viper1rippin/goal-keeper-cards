
import React from "react";
import WelcomeCard from "@/components/WelcomeCard";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import GoalsList from "@/components/GoalsList";
import LoadingGoals from "@/components/LoadingGoals";
import { useIndexPage } from "./IndexPageContext";

const GoalsContent: React.FC = () => {
  const { 
    parentGoals, 
    isLoading, 
    activeGoalIndices,
    handleGoalFocus, 
    handleCreateOrEditGoal, 
    handleUpdateSubGoals,
    handleDragEnd
  } = useIndexPage();

  return (
    <main className="flex-1 py-10 px-6 sm:px-8 md:px-12 lg:px-16">
      <WelcomeCard onAddGoal={() => handleCreateOrEditGoal(null)} />
      
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
        />
      )}
    </main>
  );
};

export default GoalsContent;
