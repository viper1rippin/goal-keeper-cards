
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TimelineItem } from "./RoadmapTimeline";

interface TimelineSubGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TimelineItem | null;
  onSave: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
}

const TimelineSubGoalDialog: React.FC<TimelineSubGoalDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete
}) => {
  const [formValues, setFormValues] = React.useState<TimelineItem | null>(null);
  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);
  
  // Initialize form when item changes
  React.useEffect(() => {
    if (item) {
      setFormValues({
        ...item,
        startDate: item.startDate || new Date(),
        endDate: item.endDate || new Date()
      });
    }
  }, [item]);
  
  if (!formValues) return null;
  
  const handleChange = (field: keyof TimelineItem, value: any) => {
    setFormValues(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValues) {
      onSave(formValues);
    }
  };
  
  const handleDelete = () => {
    if (formValues && formValues.id) {
      onDelete(formValues.id);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{formValues.id ? 'Edit Sub-Goal' : 'Add Sub-Goal'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formValues.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formValues.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formValues.startDate ? format(formValues.startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={formValues.startDate || undefined}
                    onSelect={(date) => {
                      handleChange('startDate', date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formValues.endDate ? format(formValues.endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={formValues.endDate || undefined}
                    onSelect={(date) => {
                      handleChange('endDate', date);
                      setEndDateOpen(false);
                    }}
                    disabled={(date) => 
                      formValues.startDate ? date < formValues.startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress">Progress ({formValues.progress}%)</Label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={formValues.progress}
              onChange={(e) => handleChange('progress', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {formValues.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The sub-goal will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit">{formValues.id ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineSubGoalDialog;
