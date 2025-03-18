
import React, { useState, useRef, useEffect } from 'react';
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const colorGradient = getRandomColor(action.content);
  
  // Position the star based on its coordinates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.left = `${action.position_x}%`;
      containerRef.current.style.top = `${action.position_y}%`;
    }
  }, [action.position_x, action.position_y]);
  
  // Generate line to center based on star position
  const calculateLine = () => {
    // Convert percentages to actual coordinates (0-1 scale)
    const x = action.position_x / 100;
    const y = action.position_y / 100;
    
    // Calculate line from center (0.5, 0.5) to star position
    return `M 0.5 0.5 L ${x} ${y}`;
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      e.preventDefault();
      
      if (containerRef.current) {
        // Calculate the offset from the mouse position to the element's position
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        setDragOffset({ x: offsetX, y: offsetY });
        setIsDragging(true);
      }
    }
  };
  
  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      e.preventDefault();
      
      const parentElement = containerRef.current.parentElement;
      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        
        // Calculate the new position based on mouse position minus the offset
        // and convert to percentage of parent container
        const x = ((e.clientX - dragOffset.x) - parentRect.left + containerRef.current.offsetWidth / 2) / parentRect.width * 100;
        const y = ((e.clientY - dragOffset.y) - parentRect.top + containerRef.current.offsetHeight / 2) / parentRect.height * 100;
        
        // Constrain to parent container boundaries
        const constrainedX = Math.max(0, Math.min(100, x));
        const constrainedY = Math.max(0, Math.min(100, y));
        
        // Update the element's position
        containerRef.current.style.left = `${constrainedX}%`;
        containerRef.current.style.top = `${constrainedY}%`;
      }
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (isDragging && containerRef.current && action.id) {
      const parentElement = containerRef.current.parentElement;
      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate position as percentage of parent container
        const x = ((rect.left + rect.width / 2) - parentRect.left) / parentRect.width * 100;
        const y = ((rect.top + rect.height / 2) - parentRect.top) / parentRect.height * 100;
        
        // Constrain to parent container boundaries
        const constrainedX = Math.max(0, Math.min(100, x));
        const constrainedY = Math.max(0, Math.min(100, y));
        
        // Update position if it changed
        if (Math.abs(constrainedX - action.position_x) > 0.5 || Math.abs(constrainedY - action.position_y) > 0.5) {
          onUpdatePosition(action.id, constrainedX, constrainedY);
        }
      }
      
      setIsDragging(false);
    }
  };
  
  // Set up event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Connection line to center */}
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0 pointer-events-none opacity-30"
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
          stroke="white"
          strokeWidth="0.002"
          fill="none"
          strokeDasharray="0.01 0.01"
          className="opacity-30"
        />
      </svg>
      
      {/* Star card */}
      <Card
        className={cn(
          "p-3 w-[140px] backdrop-blur-sm transition-all duration-300 shadow-lg",
          `bg-gradient-to-br ${colorGradient} bg-opacity-80 border-transparent`,
          isHovered ? "scale-110 shadow-xl z-20" : "scale-100"
        )}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-md filter blur-md opacity-70 -z-10 bg-inherit"></div>
        
        {/* Content */}
        <div className="relative select-text">
          <p className="text-white font-medium text-center">{action.content}</p>
          
          {/* Action buttons */}
          <div className={cn(
            "absolute -top-2 -right-2 flex gap-1 bg-slate-900/80 p-1 rounded-md opacity-0 transition-opacity",
            isHovered && "opacity-100"
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
