
import React, { useState } from "react";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentGoalSelectorProps {
  parentGoals: ParentGoal[];
  onSelect: (parentGoalId: string) => void;
}

const ParentGoalSelector = ({ parentGoals, onSelect }: ParentGoalSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="bg-slate-900/50 border-slate-800/80">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-medium text-slate-300 flex justify-between items-center">
          <span>Import from Parent Goals</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "grid transition-all duration-300 overflow-hidden",
        isExpanded ? "grid-rows-[1fr] p-4" : "grid-rows-[0fr] p-0"
      )}>
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2 pt-2">
            {parentGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No parent goals available</p>
            ) : parentGoals.map((goal) => (
              <div 
                key={goal.id}
                className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/30"
              >
                <div className="truncate text-sm text-slate-300">{goal.title}</div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0 text-emerald hover:text-emerald-light hover:bg-emerald/10"
                  onClick={() => onSelect(goal.id)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentGoalSelector;
