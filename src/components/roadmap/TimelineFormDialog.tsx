
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SubGoalTimelineForm from './SubGoalTimelineForm';
import { SubGoalTimelineItem, TimelineViewMode } from './types';

interface TimelineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: SubGoalTimelineItem | null;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (itemId: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const TimelineFormDialog: React.FC<TimelineFormDialogProps> = ({
  open,
  onOpenChange,
  selectedItem,
  onSave,
  onDelete,
  onCancel,
  viewMode
}) => {
  // Only render the dialog when there's a selected item and the dialog is open
  if (!selectedItem || !open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <SubGoalTimelineForm
          item={selectedItem}
          onSave={onSave}
          onDelete={onDelete}
          onCancel={onCancel}
          viewMode={viewMode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimelineFormDialog;
