
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentBadge, getNextBadge } from "@/utils/badgeUtils";
import { POINTS_FOR_LEVEL_UP } from "@/utils/timerUtils";

interface ProgressOverviewProps {
  currentLevel: number;
  currentPoints: number;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ 
  currentLevel, 
  currentPoints 
}) => {
  const currentBadge = getCurrentBadge(currentLevel);
  const nextBadge = getNextBadge(currentLevel);
  const CurrentBadgeIcon = currentBadge.icon;
  
  // Calculate progress percentage towards next level
  const progressPercent = (currentPoints / POINTS_FOR_LEVEL_UP) * 100;
  
  // Calculate time needed for next level
  const hoursNeeded = Math.ceil((POINTS_FOR_LEVEL_UP - currentPoints) / 60);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${currentBadge.color} flex items-center justify-center`}>
            <CurrentBadgeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{currentBadge.name}</h3>
            <p className="text-sm text-muted-foreground">Current Level: {currentLevel}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {hoursNeeded} hours of focus time needed to level up
          </p>
        </div>
        
        {nextBadge && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-1">Next Badge</h4>
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${nextBadge.color} flex items-center justify-center opacity-60`}>
                <nextBadge.icon className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm">
                <span className="font-medium">{nextBadge.name}</span> at level {nextBadge.level}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
