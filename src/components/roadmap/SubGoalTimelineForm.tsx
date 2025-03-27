
import React from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import TimelineItemForm from './TimelineItemForm';

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = (props) => {
  // This component is a simple wrapper around TimelineItemForm
  // We pass all props directly to TimelineItemForm
  return <TimelineItemForm {...props} />;
};

export default SubGoalTimelineForm;
