
import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { getCardGradient } from "@/components/GoalCardGradients";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Import the TimelineItem type from the parent component
interface TimelineItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  parentGoalId: string;
  parentGoalTitle: string;
}

interface TimelineSubGoalCardProps {
  item: TimelineItem;
  style: React.CSSProperties;
  onClick: () => void;
  onResize: (id: string, startDate: Date, endDate: Date) => void;
  index: number;
}

const TimelineSubGoalCard: React.FC<TimelineSubGoalCardProps> = ({
  item,
  style,
  onClick,
  onResize,
  index
}) => {
  const [resizing, setResizing] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const initialPosition = useRef({ x: 0, width: 0 });
  const initialDates = useRef({ start: item.startDate, end: item.endDate });
  const cardGradient = getCardGradient(item.title);
  
  if (!item.startDate || !item.endDate) return null;
  
  // Handle mouse down on resize handle
  const handleResizeStart = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    setResizing(direction);
    
    // Store initial values
    if (cardRef.current) {
      initialPosition.current = {
        x: cardRef.current.getBoundingClientRect().left,
        width: cardRef.current.getBoundingClientRect().width
      };
      initialDates.current = {
        start: item.startDate,
        end: item.endDate
      };
    }
    
    // Add event listeners for mouse move and mouse up
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle mouse move during resize
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing || !cardRef.current || !item.startDate || !item.endDate) return;
    
    const container = cardRef.current.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    
    // Apply visual resize effect (we'll calculate actual dates on mouse up)
    if (resizing === 'left') {
      const newLeft = Math.max(containerRect.left, Math.min(cardRect.right - 50, e.clientX));
      const newWidth = cardRect.right - newLeft;
      cardRef.current.style.left = `${newLeft - containerRect.left}px`;
      cardRef.current.style.width = `${newWidth}px`;
    } else if (resizing === 'right') {
      const newWidth = Math.max(50, Math.min(containerRect.right - cardRect.left, e.clientX - cardRect.left));
      cardRef.current.style.width = `${newWidth}px`;
    }
  };
  
  // Handle mouse up to end resizing
  const handleResizeEnd = () => {
    if (!resizing || !cardRef.current || !item.id || !item.startDate || !item.endDate) {
      cleanup();
      return;
    }
    
    const container = cardRef.current.parentElement;
    if (!container) {
      cleanup();
      return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const initialRect = initialPosition.current;
    
    try {
      // Calculate new dates based on the resize
      const totalDuration = item.endDate.getTime() - item.startDate.getTime();
      const pixelsPerMs = initialRect.width / totalDuration;
      
      let newStartDate = item.startDate;
      let newEndDate = item.endDate;
      
      if (resizing === 'left') {
        // Calculate how many ms to add/subtract from start date
        const startDeltaPixels = (cardRect.left - containerRect.left) - (initialRect.x - containerRect.left);
        const startDeltaMs = startDeltaPixels / pixelsPerMs;
        newStartDate = new Date(item.startDate.getTime() + startDeltaMs);
      } else if (resizing === 'right') {
        // Calculate how many ms to add/subtract from end date
        const endDeltaPixels = cardRect.width - initialRect.width;
        const endDeltaMs = endDeltaPixels / pixelsPerMs;
        newEndDate = new Date(item.endDate.getTime() + endDeltaMs);
      }
      
      // Ensure end date is after start date
      if (newEndDate <= newStartDate) {
        if (resizing === 'left') {
          newStartDate = new Date(newEndDate.getTime() - 86400000); // 1 day before
        } else {
          newEndDate = new Date(newStartDate.getTime() + 86400000); // 1 day after
        }
      }
      
      // Update with new dates
      onResize(item.id, newStartDate, newEndDate);
    } catch (error) {
      console.error('Error calculating new dates', error);
      // Reset to original position on error
      if (cardRef.current) {
        cardRef.current.style.left = `${initialRect.x - containerRect.left}px`;
        cardRef.current.style.width = `${initialRect.width}px`;
      }
    }
    
    cleanup();
  };
  
  // Clean up event listeners
  const cleanup = () => {
    setResizing(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  return (
    <div
      ref={cardRef}
      style={style}
      className={cn(
        "absolute glass-card rounded-md border transition-all duration-200 cursor-pointer hover:shadow-md group",
        // Add some styling based on progress
        item.progress === 100 
          ? "border-emerald-500/30" 
          : "border-slate-700/50",
        resizing ? "z-10 shadow-lg" : ""
      )}
    >
      <div 
        className={cn(
          "w-full h-full p-2 flex flex-col",
          `bg-gradient-to-br ${cardGradient} rounded-md`
        )}
        onClick={resizing ? undefined : onClick}
      >
        {/* Card content */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 truncate text-sm font-medium">{item.title}</div>
        </div>
        
        <div className="text-xs text-muted-foreground mb-1 truncate">
          {format(item.startDate, 'MMM d')} - {format(item.endDate, 'MMM d, yyyy')}
        </div>
        
        {/* Progress bar */}
        <Progress value={item.progress} className="h-1.5 mt-auto" />
        
        {/* Resize handles */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/20"
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/20"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
      </div>
    </div>
  );
};

export default TimelineSubGoalCard;
