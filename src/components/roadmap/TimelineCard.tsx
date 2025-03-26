
import React, { useState, useRef, useEffect } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal, AlertTriangle, Star, Package, Monitor, Cpu, Rocket, Layers, Smartphone, Globe, Server, HardDrive } from "lucide-react";

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
  const [currentDuration, setCurrentDuration] = useState(item.duration);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: isResizing
  });

  useEffect(() => {
    setCurrentDuration(item.duration);
    setInitialDuration(item.duration);
  }, [item.duration]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${currentDuration * cellWidth}px`,
    zIndex: isDragging ? 100 : isResizing ? 50 : isSelected ? 10 : 1,
  };

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
      case 'marketing':
        return <Rocket size={16} className="text-white" />;
      case 'feature':
        return <Layers size={16} className="text-white" />;
      case 'mobile':
        return <Smartphone size={16} className="text-white" />;
      case 'web':
        return <Globe size={16} className="text-white" />;
      case 'backend':
        return <Server size={16} className="text-white" />;
      case 'infrastructure':
        return <HardDrive size={16} className="text-white" />;
      default:
        return <Layers size={16} className="text-white" />;
    }
  };

  const getCategoryStyles = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return "from-purple-400 to-purple-500 border-purple-300";
      case 'research':
        return "from-amber-400 to-amber-500 border-amber-300";
      case 'design':
        return "from-pink-400 to-pink-500 border-pink-300";
      case 'development':
        return "from-blue-400 to-blue-500 border-blue-300";
      case 'testing':
        return "from-teal-400 to-teal-500 border-teal-300";
      case 'marketing':
        return "from-red-400 to-red-500 border-red-300";
      case 'feature':
        return "from-emerald-400 to-emerald-500 border-emerald-300";
      case 'mobile':
        return "from-cyan-400 to-cyan-500 border-cyan-300";
      case 'web':
        return "from-indigo-400 to-indigo-500 border-indigo-300";
      case 'backend':
        return "from-violet-400 to-violet-500 border-violet-300";
      case 'infrastructure':
        return "from-gray-400 to-gray-500 border-gray-300";
      default:
        return "from-emerald-400 to-emerald-500 border-emerald-300";
    }
  };

  const cardGradient = getCategoryStyles();
  const categoryIcon = getCategoryIcon();

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(currentDuration);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    
    const maxDuration = viewMode === 'month' ? 31 : 12;
    const newDuration = Math.max(1, Math.min(maxDuration, initialDuration + deltaUnits));
    
    setCurrentDuration(newDuration);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    
    if (onResize && currentDuration !== item.duration) {
      onResize(item.id, currentDuration);
    }
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        cursor: isResizing ? 'ew-resize' : isDragging ? 'grabbing' : 'grab',
      }}
      className={cn(
        "h-[120px] rounded-lg transition-all", 
        isDragging ? "opacity-80 z-50" : "opacity-100",
        "select-none"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-4 py-3 transition-all relative overflow-hidden border shadow-md",
          isSelected
            ? `bg-gradient-to-r ${cardGradient} shadow-lg shadow-emerald/30`
            : isHovered
              ? `bg-gradient-to-r ${cardGradient} shadow-sm shadow-emerald/20 opacity-95`
              : `bg-gradient-to-r ${cardGradient} opacity-90`
        )}
      >
        <div 
          className={cn(
            "absolute top-2 left-2 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all z-10",
            isResizing ? "cursor-ew-resize" : "cursor-grab"
          )}
          {...(isResizing ? {} : listeners)}
          {...attributes}
        >
          <GripHorizontal size={14} />
        </div>
        
        {categoryIcon && (
          <div className="absolute left-3 top-3">
            {categoryIcon}
          </div>
        )}
        
        {onEdit && (isHovered || isSelected) && !isResizing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Edit goal"
          >
            <Edit2 size={14} />
          </button>
        )}
        
        <div className={cn(
          "flex flex-col h-full relative z-2 pt-4",
          categoryIcon ? "pl-7" : ""
        )}>
          <h3 className="font-medium text-base text-white line-clamp-2 drop-shadow-sm">{item.title}</h3>
          
          {item.description && (
            <p className="mt-2 text-sm text-white/90 line-clamp-3 drop-shadow-sm">{item.description}</p>
          )}
          
          {currentDuration > 1 && (
            <div className="mt-auto select-none">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {onResize && (
          <div 
            className={cn(
              "absolute top-0 right-0 w-1 h-full cursor-ew-resize group",
              "after:content-[''] after:absolute after:top-0 after:right-0 after:w-4 after:h-full after:bg-transparent",
              "hover:after:bg-white/20 hover:after:backdrop-blur-sm",
              isResizing && "after:bg-white/20 after:backdrop-blur-sm"
            )}
            onMouseDown={handleResizeStart}
            aria-label="Resize card"
          />
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
