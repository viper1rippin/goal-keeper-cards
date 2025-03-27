
import React from 'react';

interface TimelineCardResizeHandleProps {
  resizeRef: React.RefObject<HTMLDivElement>;
  handleResizeStart: (e: React.PointerEvent) => void;
}

const TimelineCardResizeHandle: React.FC<TimelineCardResizeHandleProps> = ({
  resizeRef,
  handleResizeStart
}) => {
  return (
    <div 
      ref={resizeRef}
      className="absolute right-0 top-0 bottom-0 w-16 cursor-ew-resize group"
      onPointerDown={handleResizeStart}
    >
      <div className="absolute right-0 top-0 h-full w-2 bg-white/60 opacity-40 group-hover:opacity-100 transition-opacity rounded-l-md" />
    </div>
  );
};

export default TimelineCardResizeHandle;
