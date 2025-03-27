
import { useState, useRef, useEffect } from 'react';

interface UseResizeTimelineProps {
  initialDuration: number;
  cellWidth: number;
  onResize?: (itemId: string, newDuration: number) => void;
  itemId: string;
}

export const useResizeTimeline = ({ 
  initialDuration, 
  cellWidth, 
  onResize, 
  itemId 
}: UseResizeTimelineProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [initialResizeDuration, setInitialResizeDuration] = useState(initialDuration);
  const [currentWidth, setCurrentWidth] = useState(`${initialDuration * cellWidth}px`);
  const [tempDuration, setTempDuration] = useState(initialDuration);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Update width when duration or cellWidth changes (and not resizing)
  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(`${initialDuration * cellWidth}px`);
      setTempDuration(initialDuration);
    }
  }, [initialDuration, cellWidth, isResizing]);
  
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialResizeDuration(tempDuration);
    
    resizeRef.current?.setPointerCapture(e.pointerId);
    
    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', handleResizeEnd);
    
    if (cardRef.current) {
      cardRef.current.classList.add('resizing');
    }
  };
  
  const handleResizeMove = (e: PointerEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    
    const livePixelWidth = Math.max(cellWidth, initialResizeDuration * cellWidth + deltaX);
    setCurrentWidth(`${livePixelWidth}px`);
    
    const preciseDuration = livePixelWidth / cellWidth;
    
    const intDuration = Math.max(1, Math.round(preciseDuration));
    
    if (intDuration !== tempDuration) {
      setTempDuration(intDuration);
      if (onResize) onResize(itemId, intDuration);
    }
  };
  
  const handleResizeEnd = (e: PointerEvent) => {
    if (!isResizing) return;
    
    setIsResizing(false);
    
    if (tempDuration !== initialResizeDuration && onResize) {
      onResize(itemId, tempDuration);
    }
    
    if (e.pointerId && resizeRef.current) {
      resizeRef.current.releasePointerCapture(e.pointerId);
    }
    
    document.removeEventListener('pointermove', handleResizeMove);
    document.removeEventListener('pointerup', handleResizeEnd);
    
    if (cardRef.current) {
      cardRef.current.classList.remove('resizing');
    }
  };
  
  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handleResizeMove);
      document.removeEventListener('pointerup', handleResizeEnd);
    };
  }, []);
  
  return {
    isResizing,
    currentWidth,
    tempDuration,
    cardRef,
    resizeRef,
    handleResizeStart
  };
};
