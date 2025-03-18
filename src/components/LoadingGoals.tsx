
import React from "react";
import AnimatedContainer from "./AnimatedContainer";

const LoadingGoals: React.FC = () => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <div className="py-20 text-center text-slate-400 select-none">
        <p>Loading your goals...</p>
      </div>
    </AnimatedContainer>
  );
};

export default LoadingGoals;
