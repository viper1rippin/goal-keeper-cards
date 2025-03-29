
import { SubGoalTimelineItem, TimelineViewMode } from '../types';

interface UseTimelineFormProps {
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  currentYear: number;
  currentMonth: number;
  viewMode: TimelineViewMode;
  setOpenForm: (open: boolean) => void;
  setSelectedItem: (item: SubGoalTimelineItem | null) => void;
}

export const useTimelineForm = ({
  items,
  onItemsChange,
  currentYear,
  currentMonth,
  viewMode,
  setOpenForm,
  setSelectedItem
}: UseTimelineFormProps) => {
  
  const handleAddItem = () => {
    const today = new Date(currentYear, currentMonth, 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const newItem: SubGoalTimelineItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      progress: 0,
      row: 0,
      start: viewMode === 'month' ? 0 : today.getMonth(),
      duration: viewMode === 'month' ? 7 : 2,
      startDate: today.toISOString(),
      endDate: oneMonthLater.toISOString()
    };
    
    setSelectedItem(newItem);
    setOpenForm(true);
  };
  
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    
    if (!item.startDate || !item.endDate) {
      const { startDate, endDate } = updateDatesFromTimelinePosition(
        item.start,
        item.duration,
        currentYear,
        currentMonth,
        viewMode
      );
      
      item.startDate = startDate.toISOString();
      item.endDate = endDate.toISOString();
    }
    
    const updatedItems = isEditing
      ? items.map(i => (i.id === item.id ? item : i))
      : [...items, item];
    
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  return {
    handleAddItem,
    handleSaveItem,
    handleDeleteItem
  };
};
