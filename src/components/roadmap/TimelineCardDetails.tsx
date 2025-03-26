
import React from "react";
import { SubGoalTimelineItem } from "./types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarClock, Clock, BarChart } from "lucide-react";

interface TimelineCardDetailsProps {
  item: SubGoalTimelineItem;
  children: React.ReactNode;
}

const TimelineCardDetails = ({ item, children }: TimelineCardDetailsProps) => {
  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div>{children}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-slate-900/95 border-slate-700 text-white p-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          
          <div className="space-y-2">
            {item.description && (
              <p className="text-sm text-slate-300">{item.description}</p>
            )}
            
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center text-xs text-slate-400">
                <CalendarClock size={14} className="mr-2" />
                <span>Duration: {item.duration} {item.duration === 1 ? 'unit' : 'units'}</span>
              </div>
              
              <div className="flex items-center text-xs text-slate-400">
                <Clock size={14} className="mr-2" />
                <span>Category: {item.category || 'Default'}</span>
              </div>
              
              <div className="flex items-center text-xs text-slate-400">
                <BarChart size={14} className="mr-2" />
                <span>Progress: {item.progress}%</span>
              </div>
            </div>
          </div>
          
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-white/80 transition-all duration-700 ease-out"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TimelineCardDetails;
