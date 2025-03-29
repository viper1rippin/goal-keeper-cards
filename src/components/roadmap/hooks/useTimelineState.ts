
import { useState } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from '../types';
import { useTimelineNavigation } from './useTimelineNavigation';
import { useTimelineItems } from './useTimelineItems';
import { useTimelineForm } from './useTimelineForm';

interface UseTimelineStateProps {
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
}

export const useTimelineState = ({ 
  items, 
  onItemsChange, 
  viewMode 
}: UseTimelineStateProps) => {
  const [cellWidth, setCellWidth] = useState(100);
  
  const {
    months,
    currentMonth,
    currentYear,
    timeUnits,
    timeUnitCount,
    navigatePrevious,
    navigateNext
  } = useTimelineNavigation(viewMode);
  
  const {
    selectedItem,
    openForm,
    maxRow,
    handleResizeItem,
    handleEditItem,
    setSelectedItem,
    setOpenForm
  } = useTimelineItems({
    items,
    onItemsChange,
    currentYear,
    currentMonth,
    viewMode
  });
  
  const {
    handleAddItem,
    handleSaveItem,
    handleDeleteItem
  } = useTimelineForm({
    items,
    onItemsChange,
    currentYear,
    currentMonth,
    viewMode,
    setOpenForm,
    setSelectedItem
  });
  
  return {
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
  };
};
