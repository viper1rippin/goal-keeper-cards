
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Moon, 
  Sun, 
  SunMoon,
  Orbit,
  Plus, 
  Sparkles,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alignment {
  id: string;
  name: string;
  level: number;
  type: "star" | "moon" | "sun" | "orbit" | "cosmic";
  project_id: string;
}

interface ZodiacAlignmentProps {
  projectId: string;
}

const ZodiacAlignment = ({ projectId }: ZodiacAlignmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alignments, setAlignments] = useState<Alignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAlignmentName, setNewAlignmentName] = useState("");
  const [newAlignmentType, setNewAlignmentType] = useState<Alignment["type"]>("star");
  
  useEffect(() => {
    const fetchAlignments = async () => {
      try {
        setIsLoading(true);
        
        if (!user || !projectId) return;
        
        const { data, error } = await supabase
          .from('alignments')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setAlignments(data || []);
      } catch (error) {
        console.error("Error fetching alignments:", error);
        toast({
          title: "Error",
          description: "Failed to load zodiac alignments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlignments();
  }, [projectId, user, toast]);
  
  const handleAddNew = async () => {
    if (!newAlignmentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alignment name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!user || !projectId) return;
      
      const newAlignment = {
        name: newAlignmentName.trim(),
        type: newAlignmentType,
        level: 1,
        project_id: projectId,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('alignments')
        .insert([newAlignment])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        setAlignments([...alignments, data[0]]);
        setNewAlignmentName("");
        setIsAddingNew(false);
        
        toast({
          title: "Success",
          description: "New alignment added",
        });
      }
    } catch (error) {
      console.error("Error adding alignment:", error);
      toast({
        title: "Error",
        description: "Failed to add new alignment",
        variant: "destructive",
      });
    }
  };
  
  const handleIncrementLevel = async (alignment: Alignment) => {
    if (alignment.level >= 5) return;
    
    try {
      const newLevel = alignment.level + 1;
      
      const { error } = await supabase
        .from('alignments')
        .update({ level: newLevel })
        .eq('id', alignment.id);
        
      if (error) throw error;
      
      setAlignments(alignments.map(a => 
        a.id === alignment.id ? { ...a, level: newLevel } : a
      ));
      
      toast({
        title: "Alignment Increased",
        description: `${alignment.name} is now level ${newLevel}`,
      });
    } catch (error) {
      console.error("Error updating alignment:", error);
      toast({
        title: "Error",
        description: "Failed to update alignment level",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (alignmentId: string) => {
    try {
      const { error } = await supabase
        .from('alignments')
        .delete()
        .eq('id', alignmentId);
        
      if (error) throw error;
      
      setAlignments(alignments.filter(a => a.id !== alignmentId));
      
      toast({
        title: "Alignment Removed",
        description: "The alignment has been removed",
      });
    } catch (error) {
      console.error("Error deleting alignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete alignment",
        variant: "destructive",
      });
    }
  };
  
  const renderAlignmentIcon = (type: Alignment["type"], level: number) => {
    const baseClasses = "h-6 w-6";
    const colorClass = level >= 3 ? "text-yellow-400" : "text-slate-300";
    
    switch (type) {
      case "star":
        return <Star className={cn(baseClasses, colorClass)} />;
      case "moon":
        return <Moon className={cn(baseClasses, colorClass)} />;
      case "sun":
        return <Sun className={cn(baseClasses, colorClass)} />;
      case "orbit":
        return <Orbit className={cn(baseClasses, colorClass)} />;
      case "cosmic":
        return <SunMoon className={cn(baseClasses, colorClass)} />;
      default:
        return <Star className={cn(baseClasses, colorClass)} />;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-emerald" />
            Zodiac Alignments
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAddingNew(!isAddingNew)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingNew && (
          <div className="mb-4 p-3 border border-slate-700 rounded-md space-y-3 bg-slate-800/50">
            <input
              type="text"
              placeholder="Alignment name"
              className="w-full px-3 py-2 bg-background rounded border border-slate-700"
              value={newAlignmentName}
              onChange={(e) => setNewAlignmentName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newAlignmentType === "star" && "border-emerald text-emerald")}
                onClick={() => setNewAlignmentType("star")}
              >
                <Star className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newAlignmentType === "moon" && "border-emerald text-emerald")}
                onClick={() => setNewAlignmentType("moon")}
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newAlignmentType === "sun" && "border-emerald text-emerald")}
                onClick={() => setNewAlignmentType("sun")}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newAlignmentType === "orbit" && "border-emerald text-emerald")}
                onClick={() => setNewAlignmentType("orbit")}
              >
                <Orbit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newAlignmentType === "cosmic" && "border-emerald text-emerald")}
                onClick={() => setNewAlignmentType("cosmic")}
              >
                <SunMoon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAddNew}
              >
                Add
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading alignments...</div>
        ) : alignments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No alignments yet</p>
            <p className="text-sm mt-1">Add elements that will harmonize with your goal</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alignments.map((alignment) => (
              <li 
                key={alignment.id} 
                className="group flex items-center justify-between p-3 border border-slate-700 rounded-md bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {renderAlignmentIcon(alignment.type, alignment.level)}
                  <span>{alignment.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full mx-0.5",
                          i < alignment.level ? "bg-emerald" : "bg-slate-700"
                        )}
                        onClick={() => handleIncrementLevel(alignment)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(alignment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ZodiacAlignment;
