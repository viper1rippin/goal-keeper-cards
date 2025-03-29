
import React from 'react';
import { SubGoalTimelineItem } from './types';

interface DraggingGhostProps {
  draggingItem: SubGoalTimelineItem | undefined;
  ghostPosition: { left: number; top: number };
  cellWidth: number;
}

const DraggingGhost: React.FC<DraggingGhostProps> = ({
  draggingItem,
  ghostPosition,
  cellWidth
}) => {
  if (!draggingItem) return null;
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        top: `${ghostPosition.top}px`,
        left: `${ghostPosition.left}px`,
        width: `${draggingItem.duration * cellWidth}px`,
        zIndex: 999,
      }}
    >
      <div className="h-[80px] rounded-lg bg-emerald-500/80 border-2 border-white/80 shadow-lg shadow-black/30">
        <div className="p-2 text-white truncate">
          {draggingItem.title}
        </div>
      </div>
    </div>
  );
};

export default DraggingGhost;
