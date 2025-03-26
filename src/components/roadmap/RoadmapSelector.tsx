
import React from "react";
import { RoadmapData } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapSelectorProps {
  roadmaps: RoadmapData[];
  selectedId: string | null;
  onSelect: (roadmapId: string) => void;
}

const RoadmapSelector = ({ roadmaps, selectedId, onSelect }: RoadmapSelectorProps) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800/80">
      <CardContent className="p-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              onClick={() => onSelect(roadmap.id)}
              className={cn(
                "flex-shrink-0 px-4 py-3 rounded-md cursor-pointer transition-all",
                selectedId === roadmap.id
                  ? "bg-emerald/20 border border-emerald/30"
                  : "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                {selectedId === roadmap.id && (
                  <div className="w-5 h-5 rounded-full bg-emerald/30 flex items-center justify-center">
                    <Check size={12} className="text-emerald" />
                  </div>
                )}
                <span className={cn(
                  "font-medium",
                  selectedId === roadmap.id ? "text-emerald-light" : "text-slate-300"
                )}>
                  {roadmap.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-5">
                {roadmap.items?.length || 0} items
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadmapSelector;
