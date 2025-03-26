
import React, { useState, useRef } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal, AlertTriangle, Star, Package, Monitor, Cpu, ArrowRightLeft, BeakerIcon } from "lucide-react";

interface TimelineCardProps {
  item: SubGoalTimelineItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onResize?: (itemId: string, newDuration: number) => void;
  cellWidth: number;
  viewMode: TimelineViewMode;
}

const TimelineCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onEdit,
  onResize,
  cellWidth,
  viewMode
}: TimelineCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [initialDuration, setInitialDuration] = useState(item.duration);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  
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
    width: `${item.duration * cellWidth}px`,
    zIndex: isDragging ? 100 : isSelected ? 10 : 1,
  };
  
  // Get category-based colors
  const getCategoryColors = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return 'from-amber-500 to-amber-600 border-amber-400';
      case 'feature':
        return 'from-blue-400 to-blue-500 border-blue-300';
      case 'research':
        return 'from-purple-400 to-purple-500 border-purple-300';
      case 'design':
        return 'from-pink-400 to-pink-500 border-pink-300';
      case 'development':
        return 'from-emerald-400 to-emerald-500 border-emerald-300';
      case 'testing':
        return 'from-orange-400 to-orange-500 border-orange-300';
      case 'marketing':
        return 'from-red-400 to-red-500 border-red-300';
      case 'mobile':
        return 'from-rose-400 to-rose-500 border-rose-300';
      case 'web':
        return 'from-emerald-400 to-emerald-500 border-emerald-300';
      case 'infrastructure':
        return 'from-purple-400 to-purple-500 border-purple-300';
      case 'backend':
        return 'from-slate-500 to-slate-600 border-slate-400';
      default:
        return 'from-emerald-400 to-emerald-500 border-emerald-300';
    }
  };
  
  // Get category icon
  const getCategoryIcon = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return <Star size={16} className="text-white" />;
      case 'research':
        return <AlertTriangle size={16} className="text-white" />;
      case 'design':
        return <Package size={16} className="text-white" />;
      case 'development':
        return <Monitor size={16} className="text-white" />;
      case 'testing':
        return <Cpu size={16} className="text-white" />;
      default:
        return null;
    }
  };

  const colorClass = getCategoryColors();
  const categoryIcon = getCategoryIcon();
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(item.duration);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    const newDuration = Math.max(1, initialDuration + deltaUnits);
    
    if (onResize) {
      onResize(item.id, newDuration);
    }
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-[80px] rounded-lg transition-all duration-300",
        isDragging ? "opacity-80 z-50" : "opacity-100",
        "transform-gpu cursor-grab select-none",
      )}
      {...attributes}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-3 py-2 transition-all duration-300 relative overflow-hidden border shadow-md",
          isSelected
            ? `bg-gradient-to-r ${colorClass} shadow-lg shadow-black/30`
            : isHovered
              ? `bg-gradient-to-r ${colorClass} shadow-sm shadow-black/20 opacity-95`
              : `bg-gradient-to-r ${colorClass} opacity-90`
        )}
      >
        {/* Drag handle */}
        <div 
          className="absolute top-1 left-1 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all cursor-grab z-10"
          {...listeners}
        >
          <GripHorizontal size={12} />
        </div>
        
        {/* Category icon */}
        {categoryIcon && (
          <div className="absolute left-2 top-2">
            {categoryIcon}
          </div>
        )}
        
        {/* Edit button */}
        {onEdit && (isHovered || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Edit goal"
          >
            <Edit2 size={12} />
          </button>
        )}
        
        {/* Content */}
        <div className={cn(
          "flex flex-col h-full relative z-2 pt-3",
          categoryIcon ? "pl-6" : ""
        )}>
          <h3 className="font-medium text-sm text-white line-clamp-1">{item.title}</h3>
          
          {item.description && item.duration > 2 && (
            <p className="text-xs text-white/80 flex-1 mt-1 line-clamp-2">{item.description}</p>
          )}
          
          {/* Progress bar for items with longer duration */}
          {item.duration > 1 && (
            <div className="mt-auto select-none">
              <div className="h-1 bg-black/30 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Resize handle */}
        {onResize && (
          <div 
            ref={resizeRef}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
