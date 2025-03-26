import React, { useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Pencil, Trash2, Timer, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Assuming the Goal type is defined in this file
export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  color?: string;
  timeline_row?: number;
  timeline_start?: number;
  timeline_duration?: number;
  timeline_category?: string;
  start_date?: string;
  end_date?: string;
}

interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
  isActiveFocus: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  onViewDetail?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  title,
  description,
  progress,
  index,
  isFocused,
  onFocus,
  isActiveFocus,
  onEdit,
  onDelete,
  isDragging,
  onViewDetail
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={cn(
        "bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-4 relative transition-all duration-200",
        isFocused && "ring-2 ring-blue-500",
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Goal Content */}
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Open menu" className={cn("p-1 rounded-sm inline-flex items-center justify-center hover:bg-slate-700/50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", isActiveFocus && "opacity-100")}>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white" align="end" forceMount>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onFocus}>
                <Timer className="h-4 w-4 mr-2" />
                Focus
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onViewDetail}>
                <Eye className="h-4 w-4 mr-2" />
                View Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-auto">
          <Progress value={progress} className="h-2 bg-slate-700/50" />
          <p className="text-xs text-right text-slate-400 mt-1">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
