
import React from "react";
import AnimatedContainer from "./AnimatedContainer";

interface LoadingGoalsProps {
  message?: string;
}

const LoadingGoals: React.FC<LoadingGoalsProps> = ({ message = "Loading your goals..." }) => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <div className="py-20 text-center text-slate-400 select-none">
        <p>{message}</p>
      </div>
    </AnimatedContainer>
  );
};

export default LoadingGoals;
