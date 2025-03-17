
import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  height?: "sm" | "md" | "lg";
  colorClass?: string;
}

export const ProgressBar = ({
  value,
  max,
  className,
  showLabel = true,
  labelClassName,
  height = "md",
  colorClass,
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }[height];
  
  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className={cn("flex justify-between text-sm", labelClassName)}>
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(heightClass, colorClass)} 
      />
    </div>
  );
};
