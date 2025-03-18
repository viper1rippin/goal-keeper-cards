
import React from 'react';
import { useSelection } from '@/context/SelectionContext';
import { Button } from './ui/button';
import { X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SelectionToolbarProps {
  onDeleteSelected: (goalIds: string[]) => Promise<void>;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  onDeleteSelected
}) => {
  const { selectedGoals, clearSelection, selectedCount } = useSelection();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Don't render if nothing is selected
  if (selectedCount === 0) return null;

  const handleClearSelection = () => {
    clearSelection();
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;
    
    try {
      setIsDeleting(true);
      const selectedIds = Object.keys(selectedGoals);
      await onDeleteSelected(selectedIds);
      clearSelection();
      
      toast({
        title: "Success",
        description: `${selectedCount} ${selectedCount === 1 ? 'goal' : 'goals'} deleted`,
      });
    } catch (error) {
      console.error('Error deleting goals:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected goals",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100/90 backdrop-blur-sm border-b border-slate-800 dark:border-slate-800 light:border-slate-300 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald text-white">
            {selectedCount}
          </div>
          <span className="text-slate-200 dark:text-slate-200 light:text-slate-800">
            {selectedCount} {selectedCount === 1 ? 'goal' : 'goals'} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="text-slate-400 hover:text-slate-100 dark:hover:text-white light:hover:text-slate-900"
          >
            <X size={18} className="mr-1" />
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectionToolbar;
