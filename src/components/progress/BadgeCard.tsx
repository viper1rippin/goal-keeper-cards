
import React from "react";
import { Badge } from "@/utils/badgeUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge;
  currentLevel: number;
  isLocked?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  currentLevel,
  isLocked = false 
}) => {
  const BadgeIcon = badge.icon;
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isLocked ? "opacity-60" : "hover:shadow-md"
    )}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className={cn(
          "w-16 h-16 rounded-full mb-3 flex items-center justify-center",
          `bg-gradient-to-r ${badge.color}`,
          isLocked && "grayscale"
        )}>
          {isLocked ? (
            <Lock className="h-8 w-8 text-white" />
          ) : (
            <BadgeIcon className="h-8 w-8 text-white" />
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground">
          {isLocked ? (
            `Unlock at level ${badge.level}`
          ) : (
            `Earned at level ${badge.level}`
          )}
        </p>
        
        {isLocked && (
          <div className="mt-3 text-xs">
            {Math.max(0, badge.level - currentLevel)} levels to unlock
          </div>
        )}
      </CardContent>
    </Card>
  );
};
