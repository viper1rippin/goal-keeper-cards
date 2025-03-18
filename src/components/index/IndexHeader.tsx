
import React from "react";
import { useIndexPage } from "./IndexPageContext";

// This component is now a stub since we've moved the header functionality to WelcomeCard
const IndexHeader: React.FC = () => {
  const { activeGoal, showFocusTimer, setShowFocusTimer, handleStopFocus } = useIndexPage();
  
  // This component is kept for backward compatibility but no longer renders anything
  return null;
};

export default IndexHeader;
