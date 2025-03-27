
import React from 'react';

interface TimelineGridProps {
  timeUnits: (string | number)[];
  maxRow: number;
  cellWidth: number;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  timeUnits,
  maxRow,
  cellWidth
}) => {
  return (
    <>
      <div className="absolute inset-0 flex pointer-events-none">
        {timeUnits.map((_, idx) => (
          <div 
            key={idx}
            className="h-full border-r border-slate-800/70"
            style={{ width: `${cellWidth}px` }}
          ></div>
        ))}
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: maxRow }).map((_, idx) => (
          <div 
            key={idx}
            className="w-full border-b border-slate-800/70"
            style={{ height: '100px' }}
          ></div>
        ))}
      </div>
    </>
  );
};

export default TimelineGrid;
