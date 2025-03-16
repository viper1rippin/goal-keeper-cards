
import React from 'react';
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";

interface TrashZoneProps {
  isVisible: boolean;
  isOver: boolean;
}

const TrashZone: React.FC<TrashZoneProps> = ({ isVisible, isOver }) => {
  return (
    <div 
      className={cn(
        "fixed bottom-10 right-10 z-50 transition-all duration-300 bg-red-500/10 rounded-full p-5",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0",
        isOver ? "bg-red-600/20 scale-125" : "bg-red-500/10",
      )}
    >
      <div className="relative">
        <Trash 
          size={40} 
          className={cn(
            "text-red-500 transition-all duration-300",
            isOver ? "text-red-600 scale-110" : "text-red-500"
          )} 
        />
        <div 
          className={cn(
            "absolute -top-3 left-0 right-0 h-3 bg-red-500/80 rounded-t-md transition-all duration-300",
            isOver ? "rotate-45 origin-left" : "rotate-0"
          )}
        />
      </div>
    </div>
  );
};

export default TrashZone;
