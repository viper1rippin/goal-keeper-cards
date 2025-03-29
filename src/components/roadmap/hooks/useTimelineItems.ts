
import { useState, useEffect } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from '../types';
import { 
  calculateEndDateFromDurationChange, 
  syncTimelineItemWithDates,
  updateDatesFromTimelinePosition
} from '../utils/timelineUtils';

interface UseTimelineItemsProps {
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  currentYear: number;
  currentMonth: number;
  viewMode: TimelineViewMode;
}

export const useTimelineItems = ({
  items,
  onItemsChange,
  currentYear,
  currentMonth,
  viewMode
}: UseTimelineItemsProps) => {
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  
  // Sync timeline with dates
  useEffect(() => {
    if (items.length === 0) return;
    
    const syncedItems = items.map(item => 
      syncTimelineItemWithDates(item, currentYear, currentMonth, viewMode)
    );
    
    const hasChanges = syncedItems.some((item, idx) => 
      item.start !== items[idx].start || item.duration !== items[idx].duration
    );
    
    if (hasChanges) {
      onItemsChange(syncedItems);
    }
  }, [items, viewMode, currentMonth, currentYear, onItemsChange]);
  
  // Set max row
  useEffect(() => {
    if (items.length === 0) return;
    
    const maxRowValue = Math.max(...items.map(item => item.row));
    setMaxRow(Math.max(maxRowValue + 1, 3));
  }, [items]);
  
  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        if (item.startDate) {
          const startDate = new Date(item.startDate);
          const calculatedEndDate = calculateEndDateFromDurationChange(
            startDate,
            item.duration,
            newDuration,
            viewMode
          );
          
          return {
            ...item,
            duration: newDuration,
            endDate: calculatedEndDate.toISOString()
          };
        }
        
        return {
          ...item,
          duration: newDuration
        };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };
  
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };
  
  return {
    selectedItem,
    openForm,
    maxRow,
    handleResizeItem,
    handleEditItem,
    setSelectedItem,
    setOpenForm
  };
};
