
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FormHeaderProps {
  isNew: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isNew }) => {
  return (
    <DialogHeader>
      <DialogTitle>
        {isNew ? 'Add New Item' : 'Edit Item'}
      </DialogTitle>
      <DialogDescription>
        Modify the details of this timeline item
      </DialogDescription>
    </DialogHeader>
  );
};

export default FormHeader;
