
import React from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import TimelineItemForm from './TimelineItemForm';
import { formatTimelineDate, getDurationLabel } from './utils/timelineUtils';

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = (props) => {
  // This component is a simple wrapper around TimelineItemForm
  // We modify the item to add some formatted date information before passing it on
  
  const { item, viewMode } = props;
  
  // Add formatted date information that can be displayed in the form
  if (item.startDate && item.endDate) {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const durationLabel = getDurationLabel(startDate, endDate, viewMode);
    
    // Log for debugging
    console.log(`Editing item: ${item.title}, duration: ${item.duration}, dates: ${formatTimelineDate(startDate, viewMode)} - ${formatTimelineDate(endDate, viewMode)} (${durationLabel})`);
  }
  
  return <TimelineItemForm {...props} />;
};

export default SubGoalTimelineForm;
