
import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { Action } from '@/utils/actionsUtils';
import { cn } from '@/lib/utils';

interface ActionStarProps {
  action: Action;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
}

const getRandomColor = (seed: string) => {
  const colors = [
    'from-purple-500 to-indigo-500',  // Purple-indigo
    'from-blue-500 to-cyan-400',      // Blue-cyan
    'from-emerald-500 to-teal-400',   // Emerald-teal
    'from-amber-500 to-yellow-300',   // Amber-yellow
    'from-rose-500 to-pink-400',      // Rose-pink
    'from-fuchsia-500 to-purple-400', // Fuchsia-purple
    'from-cyan-500 to-blue-400',      // Cyan-blue
    'from-violet-500 to-purple-400',  // Violet-purple
  ];
  
  // Use a simple hash of the string to get a consistent color
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const ActionStar: React.FC<ActionStarProps> = ({ action, onEdit, onDelete, onUpdatePosition }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorGradient = getRandomColor(action.content);
  
  // Set up drag functionality with useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } = useDraggable({
    id: action.id || 'temp-id',
    data: { action },
  });
  
  // Update dragging state when dnd state changes
  useEffect(() => {
    setIsDragging(dndIsDragging);
  }, [dndIsDragging]);
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 50, // Raise z-index while dragging
  } : {};
  
  // Position the star based on its coordinates
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.style.left = `${action.position_x}%`;
      containerRef.current.style.top = `${action.position_y}%`;
    }
  }, [action.position_x, action.position_y, isDragging]);
  
  // Handle end of dragging
  useEffect(() => {
    if (!transform && containerRef.current && action.id) {
      const rect = containerRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.parentElement!.getBoundingClientRect();
      
      // Calculate position as percentage of parent container
      const x = ((rect.left + rect.width / 2) - parentRect.left) / parentRect.width * 100;
      const y = ((rect.top + rect.height / 2) - parentRect.top) / parentRect.height * 100;
      
      // Ensure values are within bounds (0-100%)
      const boundedX = Math.max(0, Math.min(100, x));
      const boundedY = Math.max(0, Math.min(100, y));
      
      // Update position if it changed
      if (Math.abs(boundedX - action.position_x) > 0.1 || Math.abs(boundedY - action.position_y) > 0.1) {
        onUpdatePosition(action.id, boundedX, boundedY);
      }
    }
  }, [transform, action.id, action.position_x, action.position_y, onUpdatePosition]);
  
  // Generate line to center based on star position
  const calculateLine = () => {
    // Convert percentages to actual coordinates (0-1 scale)
    const x = action.position_x / 100;
    const y = action.position_y / 100;
    
    // Calculate line from center (0.5, 0.5) to star position
    return `M 0.5 0.5 L ${x} ${y}`;
  };
  
  return (
    <div 
      ref={(node) => {
        containerRef.current = node;
        setNodeRef(node);
      }}
      style={{
        ...style,
        position: 'absolute',
        transform: isDragging ? style.transform : 'translate(-50%, -50%)',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, left 0.2s ease-out, top 0.2s ease-out',
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "z-10 cursor-move",
        isDragging ? "z-50" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection line to center */}
      <svg
        width="100%"
        height="100%"
        className={cn(
          "absolute inset-0 pointer-events-none",
          isDragging ? "opacity-70" : "opacity-30"
        )}
        style={{
          width: '200vw',
          height: '200vh',
          left: '-100vw',
          top: '-100vh',
          zIndex: -1,
        }}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <path
          d={calculateLine()}
          stroke={isDragging ? "rgba(255, 255, 255, 0.6)" : "white"}
          strokeWidth={isDragging ? "0.004" : "0.002"}
          fill="none"
          strokeDasharray="0.01 0.01"
          className={isDragging ? "opacity-70" : "opacity-30"}
        />
      </svg>
      
      {/* Star card */}
      <Card
        className={cn(
          "p-3 w-[140px] backdrop-blur-sm transition-all duration-300 shadow-lg",
          `bg-gradient-to-br ${colorGradient} bg-opacity-80 border-transparent`,
          isDragging 
            ? "scale-110 shadow-2xl z-50" 
            : isHovered 
              ? "scale-110 shadow-xl z-20" 
              : "scale-100"
        )}
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-md filter blur-md opacity-70 -z-10 bg-inherit",
          isDragging && "opacity-90 blur-lg"
        )}></div>
        
        {/* Content */}
        <div className="relative">
          <p className="text-white font-medium text-center">{action.content}</p>
          
          {/* Action buttons */}
          <div className={cn(
            "absolute -top-2 -right-2 flex gap-1 bg-slate-900/80 p-1 rounded-md opacity-0 transition-opacity",
            (isHovered && !isDragging) && "opacity-100"
          )}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-slate-800 rounded-sm"
            >
              <Pencil size={14} className="text-white/80" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-900/60 rounded-sm"
            >
              <Trash2 size={14} className="text-white/80" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActionStar;
