
import React, { useState } from "react";
import { SubGoalTimelineItem } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal } from "lucide-react";
import { getCardGradient, getProgressGradient } from "../GoalCardGradients";

interface TimelineCardProps {
  item: SubGoalTimelineItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  monthWidth: number;
}

const TimelineCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onEdit,
  monthWidth 
}: TimelineCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Setup sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Apply dnd-kit styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${item.duration * monthWidth}px`,
    zIndex: isDragging ? 100 : isSelected ? 10 : 1
  };
  
  // Generate consistent gradients based on the title
  const cardGradient = getCardGradient(item.title);
  const progressGradient = getProgressGradient(item.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute top-0 left-0 h-full rounded-lg transition-all duration-300",
        isDragging ? "opacity-80 z-50" : "opacity-100",
        "transform-gpu cursor-grab select-none",
      )}
      {...attributes}
      style={{
        ...style,
        left: `${item.start * monthWidth}px`,
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "glass-card rounded-lg h-full p-3 transition-all duration-300 relative overflow-hidden border",
          isSelected
            ? `bg-gradient-to-br ${cardGradient} border-emerald/30 shadow-lg shadow-emerald/20`
            : isHovered
              ? `bg-gradient-to-br ${cardGradient} border-emerald/15 shadow-sm shadow-emerald/10 opacity-90`
              : "bg-slate-900/80 border-slate-800/60 opacity-75"
        )}
      >
        {/* Drag handle */}
        <div 
          className="absolute top-1 left-1 p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-all cursor-grab z-10"
          {...listeners}
        >
          <GripHorizontal size={12} />
        </div>
        
        {/* Edit button */}
        {onEdit && (isHovered || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-slate-800/70 text-emerald hover:bg-slate-700/80 transition-colors z-10"
            aria-label="Edit goal"
          >
            <Edit2 size={12} />
          </button>
        )}
        
        {/* Content */}
        <div className="flex flex-col h-full relative z-2 pt-3">
          <h3 className={cn(
            "font-medium text-sm mb-1 truncate",
            isSelected 
              ? "text-white" 
              : (isHovered ? "text-slate-100" : "text-slate-400")
          )}>{item.title}</h3>
          
          <p className={cn(
            "text-xs flex-1 mb-2 line-clamp-2",
            isSelected 
              ? "text-slate-200" 
              : (isHovered ? "text-slate-300" : "text-slate-500")
          )}>{item.description}</p>
          
          {/* Progress bar */}
          <div className="mt-auto select-none">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-700 ease-out",
                  isSelected 
                    ? progressGradient
                    : (isHovered ? progressGradient : "from-emerald/40 to-emerald-light/40")
                )}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
