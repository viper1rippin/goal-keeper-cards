
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActionButtonProps {
  onClick: () => void;
  className?: string;
}

const AddActionButton: React.FC<AddActionButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={cn(
        "bg-slate-800/80 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/30 group relative overflow-hidden",
        className
      )}
    >
      <Plus size={16} className="mr-2" />
      <span>Add Action</span>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md blur-sm"></div>
    </Button>
  );
};

export default AddActionButton;
