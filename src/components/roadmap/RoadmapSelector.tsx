
import React, { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface RoadmapSelectorProps {
  selectedRoadmapId: string | null;
  onSelectRoadmap: (id: string) => void;
}

const RoadmapSelector = ({ selectedRoadmapId, onSelectRoadmap }: RoadmapSelectorProps) => {
  const { user } = useAuth();
  const [parentGoals, setParentGoals] = useState<{ id: string; title: string }[]>([
    { id: "demo", title: "Demo Roadmap" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch parent goals from database
  useEffect(() => {
    if (!user) return;
    
    const fetchParentGoals = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('parent_goals')
          .select('id, title')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Combine demo roadmap with actual parent goals
          setParentGoals([
            { id: "demo", title: "Demo Roadmap" },
            ...data
          ]);
        }
      } catch (error) {
        console.error("Error fetching parent goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParentGoals();
  }, [user]);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Roadmap:</span>
      <Select
        value={selectedRoadmapId || undefined}
        onValueChange={(value) => onSelectRoadmap(value)}
      >
        <SelectTrigger className="w-[220px] bg-slate-800 border-slate-700">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a roadmap"} />
        </SelectTrigger>
        <SelectContent>
          {parentGoals.map((goal) => (
            <SelectItem key={goal.id} value={goal.id}>
              {goal.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoadmapSelector;
