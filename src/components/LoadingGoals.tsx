
import React from "react";
import AnimatedContainer from "./AnimatedContainer";
import { Skeleton } from "./ui/skeleton";

const LoadingGoals: React.FC = () => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <div className="py-6 space-y-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center">
              <Skeleton className="h-7 w-64 mb-2" />
            </div>
            <div className="pl-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map((subIndex) => (
                <Skeleton 
                  key={`${index}-${subIndex}`} 
                  className="h-32 w-full rounded-lg" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AnimatedContainer>
  );
};

export default LoadingGoals;
