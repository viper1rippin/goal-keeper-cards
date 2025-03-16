
import React from "react";
import Header from "@/components/Header";
import { useIndexPage } from "./IndexPageContext";

const IndexHeader: React.FC = () => {
  const {
    activeGoal,
    showFocusTimer,
    setShowFocusTimer,
    handleStopFocus
  } = useIndexPage();

  return (
    <Header 
      activeGoal={activeGoal}
      showFocusTimer={showFocusTimer}
      setShowFocusTimer={setShowFocusTimer}
      onStopFocus={handleStopFocus}
    />
  );
};

export default IndexHeader;
