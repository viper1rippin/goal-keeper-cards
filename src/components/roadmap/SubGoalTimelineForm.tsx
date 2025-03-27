
import React, { useState } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubGoalTimelineItem, TimelineViewMode, TimelineCategory } from './types';
import { Trash2 } from 'lucide-react';

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem;
  onSave: (item: SubGoalTimelineItem) => void;
  onDelete?: (itemId: string) => void;
  onCancel: () => void;
  viewMode: TimelineViewMode;
}

const SubGoalTimelineForm: React.FC<SubGoalTimelineFormProps> = ({
  item,
  onSave,
  onDelete,
  onCancel,
  viewMode
}) => {
  const [formData, setFormData] = useState<SubGoalTimelineItem>({
    ...item,
    category: item.category || 'default' as TimelineCategory
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData({ ...formData, progress: value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value as TimelineCategory });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categoryOptions: { value: TimelineCategory; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'feature', label: 'Feature' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'research', label: 'Research' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'web', label: 'Web' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'backend', label: 'Backend' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{item.originalSubGoalId ? 'Edit' : 'Add'} Timeline Item</DialogTitle>
        <DialogDescription>
          {item.originalSubGoalId
            ? 'Update the details for this timeline item'
            : 'Create a new item on your roadmap timeline'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Item title"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Item description (optional)"
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category?.toString() || 'default'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
          <Input
            id="progress"
            name="progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.progress}
            onChange={handleProgressChange}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        {onDelete && item.originalSubGoalId ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(item.id)}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        ) : (
          <div></div>
        )}

        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </div>
    </form>
  );
};

export default SubGoalTimelineForm;
