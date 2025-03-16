
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";

interface EmptyGoalsListProps {
  onCreateGoal: () => void;
}

const EmptyGoalsList: React.FC<EmptyGoalsListProps> = ({ onCreateGoal }) => {
  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <div className="py-20 text-center">
        <h3 className="text-xl font-medium mb-2">No goals yet</h3>
        <p className="text-slate-400 mb-6">Create your first goal to get started</p>
        <Button 
          onClick={onCreateGoal} 
          className="bg-emerald hover:bg-emerald-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </div>
    </AnimatedContainer>
  );
};

export default EmptyGoalsList;
