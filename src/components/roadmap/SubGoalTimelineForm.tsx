
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
  return <TimelineItemForm {...props} />;
};

export default SubGoalTimelineForm;
