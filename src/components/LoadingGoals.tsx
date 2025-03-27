
import React from "react";
import AnimatedContainer from "./AnimatedContainer";
import { Skeleton } from "./ui/skeleton";

const LoadingGoals: React.FC = () => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <div className="py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <div className="pl-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedContainer>
  );
};

export default LoadingGoals;
