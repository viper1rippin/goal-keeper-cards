
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ParentGoalSelectorProps {
  parentGoals: { id: string; title: string }[];
  onSelect: (parentGoalId: string) => void;
}

const ParentGoalSelector: React.FC<ParentGoalSelectorProps> = ({ 
  parentGoals, 
  onSelect 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {parentGoals.map((goal) => (
        <Card 
          key={goal.id} 
          className={cn(
            "border-slate-800 bg-slate-900/70 cursor-pointer hover:bg-slate-800/90 transition-colors"
          )}
          onClick={() => onSelect(goal.id)}
        >
          <CardContent className="p-4">
            <h3 className="font-medium text-white mb-1 line-clamp-1">{goal.title}</h3>
            <CardDescription className="text-xs text-slate-400">
              Import sub-goals from this parent
            </CardDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs" 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(goal.id);
              }}
            >
              Import
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ParentGoalSelector;
