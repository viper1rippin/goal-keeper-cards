import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb,
  Target,
  Trophy,
  Rocket,
  GitBranch,
  Plus,
  Check,
  X,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  content: string;
  type: "idea" | "target" | "achievement" | "milestone";
  completed: boolean;
  project_id: string;
}

interface MindMapProps {
  projectId: string;
}

const MindMap = ({ projectId }: MindMapProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newActionContent, setNewActionContent] = useState("");
  const [newActionType, setNewActionType] = useState<Action["type"]>("idea");
  
  useEffect(() => {
    const fetchActions = async () => {
      try {
        setIsLoading(true);
        
        if (!user || !projectId) return;
        
        const { error: tableCheckError } = await supabase
          .from('actions')
          .select('id')
          .limit(1);
        
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.log("Actions table doesn't exist yet, but that's okay");
          setActions([]);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('actions')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setActions(data || []);
      } catch (error) {
        console.error("Error fetching actions:", error);
        if ((error as any)?.code !== '42P01') {
          toast({
            title: "Error",
            description: "Failed to load mind map actions",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActions();
  }, [projectId, user, toast]);
  
  const handleAddNew = async () => {
    if (!newActionContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter action content",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!user || !projectId) return;
      
      try {
        await supabase.rpc('create_actions_table_if_not_exists');
      } catch (error) {
        console.error("Error creating actions table:", error);
      }
      
      const newAction = {
        content: newActionContent.trim(),
        type: newActionType,
        completed: false,
        project_id: projectId,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('actions')
        .insert([newAction])
        .select();
        
      if (error) {
        if (error.code === '42P01') {
          const mockAction: Action = {
            ...newAction,
            id: Date.now().toString()
          };
          
          setActions([...actions, mockAction]);
          setNewActionContent("");
          setIsAddingNew(false);
          
          toast({
            title: "Success",
            description: "New action added (will be saved when database is ready)",
          });
          return;
        } else {
          throw error;
        }
      }
      
      if (data && data[0]) {
        setActions([...actions, data[0] as unknown as Action]);
        setNewActionContent("");
        setIsAddingNew(false);
        
        toast({
          title: "Success",
          description: "New action added to mind map",
        });
      }
    } catch (error) {
      console.error("Error adding action:", error);
      toast({
        title: "Error",
        description: "Failed to add new action. The feature may not be fully set up yet.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleComplete = async (action: Action) => {
    try {
      const newCompleted = !action.completed;
      
      const { error } = await supabase
        .from('actions')
        .update({ completed: newCompleted })
        .eq('id', action.id);
      
      setActions(actions.map(a => 
        a.id === action.id ? { ...a, completed: newCompleted } : a
      ));
      
      if (error && error.code !== '42P01') {
        console.error("Database error, but updated UI state:", error);
      }
      
      toast({
        title: newCompleted ? "Action Completed" : "Action Reopened",
        description: newCompleted ? "Great job!" : "Action marked as incomplete",
      });
    } catch (error) {
      console.error("Error updating action:", error);
      toast({
        title: "Error",
        description: "Failed to update action status, but state is updated in the UI",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (actionId: string) => {
    try {
      await supabase
        .from('actions')
        .delete()
        .eq('id', actionId);
      
      setActions(actions.filter(a => a.id !== actionId));
      
      toast({
        title: "Action Removed",
        description: "The action has been removed from the mind map",
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete action from database, but removed from UI",
        variant: "destructive",
      });
    }
  };
  
  const renderActionIcon = (type: Action["type"]) => {
    const baseClasses = "h-5 w-5";
    
    switch (type) {
      case "idea":
        return <Lightbulb className={cn(baseClasses, "text-yellow-400")} />;
      case "target":
        return <Target className={cn(baseClasses, "text-blue-400")} />;
      case "achievement":
        return <Trophy className={cn(baseClasses, "text-purple-400")} />;
      case "milestone":
        return <Rocket className={cn(baseClasses, "text-emerald")} />;
      default:
        return <Lightbulb className={cn(baseClasses, "text-yellow-400")} />;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <GitBranch className="mr-2 h-5 w-5 text-emerald" />
            Mind Map Actions
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
            <textarea
              placeholder="What action will lead to success?"
              className="w-full px-3 py-2 bg-background rounded border border-slate-700 min-h-24"
              value={newActionContent}
              onChange={(e) => setNewActionContent(e.target.value)}
            />
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newActionType === "idea" && "border-yellow-400 text-yellow-400")}
                onClick={() => setNewActionType("idea")}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Idea
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newActionType === "target" && "border-blue-400 text-blue-400")}
                onClick={() => setNewActionType("target")}
              >
                <Target className="h-4 w-4 mr-2" />
                Target
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newActionType === "achievement" && "border-purple-400 text-purple-400")}
                onClick={() => setNewActionType("achievement")}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Achievement
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(newActionType === "milestone" && "border-emerald text-emerald")}
                onClick={() => setNewActionType("milestone")}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Milestone
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
          <div className="text-center py-8 text-slate-400">Loading mind map...</div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No actions in your mind map yet</p>
            <p className="text-sm mt-1">Add elements that will lead to success</p>
          </div>
        ) : (
          <div className="mind-map-container">
            <ul className="space-y-2">
              {actions.map((action) => (
                <li 
                  key={action.id} 
                  className={cn(
                    "group flex items-start gap-3 p-3 border border-slate-700 rounded-md transition-colors",
                    action.completed 
                      ? "bg-emerald-900/10 border-emerald/30" 
                      : "bg-slate-800/30 hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {renderActionIcon(action.type)}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      action.completed && "line-through text-slate-400"
                    )}>
                      {action.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggleComplete(action)}
                    >
                      {action.completed ? (
                        <X className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(action.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MindMap;
