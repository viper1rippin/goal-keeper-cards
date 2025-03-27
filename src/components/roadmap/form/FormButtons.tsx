
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormButtonsProps {
  onDelete: () => void;
  onCancel: () => void;
}

const FormButtons: React.FC<FormButtonsProps> = ({ onDelete, onCancel }) => {
  return (
    <div className="flex justify-between gap-2 pt-4">
      <Button
        type="button"
        variant="destructive"
        onClick={onDelete}
      >
        Delete
      </Button>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </div>
  );
};

export default FormButtons;
