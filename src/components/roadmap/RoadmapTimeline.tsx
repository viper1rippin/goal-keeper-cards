
import React, { useEffect, useRef } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { useTimelineState } from './hooks/useTimelineState';
import { useTimelineDrag } from './hooks/useTimelineDrag';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import TimelineItems from './TimelineItems';
import AddItemButton from './AddItemButton';
import TimelineFormDialog from './TimelineFormDialog';

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ 
  roadmapId, 
  items, 
  onItemsChange, 
  viewMode 
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const {
    months,
    currentMonth,
    currentYear,
    selectedItem,
    openForm,
    maxRow,
    cellWidth,
    setCellWidth,
    timeUnits,
    timeUnitCount,
    handleResizeItem,
    handleEditItem,
    handleAddItem,
    handleSaveItem,
    handleDeleteItem,
    navigatePrevious,
    navigateNext,
    setSelectedItem,
    setOpenForm
  } = useTimelineState({ items, onItemsChange, viewMode });
  
  // Initialize drag handling
  const {
    timelineRef: dragTimelineRef,
    isDragging,
    draggingItemId,
    ghostPosition,
    handleDragStart
  } = useTimelineDrag({
    items,
    onItemsChange,
    timeUnitCount,
    cellWidth,
    maxRow,
    currentYear,
    currentMonth,
    viewMode
  });
  
  // Set dragTimelineRef to our timelineRef
  useEffect(() => {
    if (timelineRef.current) {
      dragTimelineRef.current = timelineRef.current;
    }
  }, [timelineRef.current]);
  
  // Calculate cell width
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      setCellWidth(Math.max(calculatedWidth, viewMode === 'month' ? 30 : 80));
    }
  }, [timelineRef.current?.clientWidth, viewMode, timeUnitCount]);
  
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
      <TimelineHeader
        months={months}
        timeUnits={timeUnits}
        cellWidth={cellWidth}
        currentMonth={currentMonth}
        currentYear={currentYear}
        viewMode={viewMode}
        onNavigatePrevious={navigatePrevious}
        onNavigateNext={navigateNext}
      />
      
      <div 
        className="relative overflow-x-auto"
        style={{ height: `${maxRow * 100 + 50}px` }}
        ref={timelineRef}
      >
        <TimelineGrid
          timeUnits={timeUnits}
          maxRow={maxRow}
          cellWidth={cellWidth}
        />
        
        <TimelineItems
          items={items}
          selectedItem={selectedItem}
          cellWidth={cellWidth}
          viewMode={viewMode}
          isDragging={isDragging}
          draggingItemId={draggingItemId}
          ghostPosition={ghostPosition}
          onEditItem={handleEditItem}
          onResizeItem={handleResizeItem}
          onSelectItem={setSelectedItem}
          onDragStart={handleDragStart}
        />
        
        <AddItemButton onClick={handleAddItem} />
      </div>
      
      <TimelineFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        selectedItem={selectedItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        onCancel={() => setOpenForm(false)}
        viewMode={viewMode}
      />
    </div>
  );
};

export default RoadmapTimeline;
