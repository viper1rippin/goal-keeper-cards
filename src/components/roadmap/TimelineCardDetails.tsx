
import React from 'react';
import { SubGoalTimelineItem } from './types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SubGoalTimelineForm from './SubGoalTimelineForm';

interface TimelineCardDetailsProps {
  item: SubGoalTimelineItem | null;
  onClose: () => void;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete: (id: string) => void;
}

const TimelineCardDetails: React.FC<TimelineCardDetailsProps> = ({
  item,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!item) return null;

  return (
    <Sheet open={!!item} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-white">
            Timeline Item
          </SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <SubGoalTimelineForm
            item={item}
            onSave={onSave}
            onDelete={onDelete}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimelineCardDetails;
