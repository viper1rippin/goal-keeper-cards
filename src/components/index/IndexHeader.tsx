
import React from "react";
import Header from "@/components/Header";
import { useIndexPage } from "./IndexPageContext";

const IndexHeader: React.FC = () => {
  const {
    activeGoal,
    parentGoals,
    showFocusTimer,
    setShowFocusTimer,
    handleStopFocus,
    handleGoalFocus
  } = useIndexPage();

  const handleGoalSelect = (goal: any) => {
    // Find the indices for this goal
    for (let rowIndex = 0; rowIndex < parentGoals.length; rowIndex++) {
      const goalIndex = parentGoals[rowIndex].goals.findIndex(g => g.id === goal.id);
      if (goalIndex !== -1) {
        handleGoalFocus(goal, rowIndex, goalIndex);
        return;
      }
    }
  };

  return (
    <Header 
      activeGoal={activeGoal}
      parentGoals={parentGoals}
      showFocusTimer={showFocusTimer}
      setShowFocusTimer={setShowFocusTimer}
      onStopFocus={handleStopFocus}
      onGoalSelect={handleGoalSelect}
    />
  );
};

export default IndexHeader;
