
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/components/GoalRow";
import ProjectHeader from "@/components/project/ProjectHeader";
import ZodiacAlignment from "@/components/project/ZodiacAlignment";
import MindMap from "@/components/project/MindMap";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import NotFound from "./NotFound";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Goal | null>(null);
  const [parentTitle, setParentTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        
        if (!user || !id) {
          setNotFound(true);
          return;
        }
        
        // Fetch the sub-goal details
        const { data: subGoalData, error: subGoalError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('id', id)
          .single();
          
        if (subGoalError || !subGoalData) {
          console.error("Error fetching project:", subGoalError);
          setNotFound(true);
          return;
        }
        
        // Format the goal data - make sure user_id is included
        const formattedGoal: Goal = {
          id: subGoalData.id,
          title: subGoalData.title,
          description: subGoalData.description || "",
          progress: subGoalData.progress || 0,
          user_id: user.id // Add user_id here
        };
        
        setProject(formattedGoal);
        
        // Fetch the parent goal name
        if (subGoalData.parent_goal_id) {
          const { data: parentData, error: parentError } = await supabase
            .from('parent_goals')
            .select('title')
            .eq('id', subGoalData.parent_goal_id)
            .single();
            
          if (!parentError && parentData) {
            setParentTitle(parentData.title);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id, user, toast]);
  
  if (notFound) {
    return <NotFound />;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-emerald animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {project && (
        <>
          <ProjectHeader 
            title={project.title} 
            parentTitle={parentTitle}
            progress={project.progress}
            onBack={() => navigate("/")}
          />
          
          <div className="max-w-7xl mx-auto p-6 grid gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <ZodiacAlignment projectId={project.id || ""} />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <MindMap projectId={project.id || ""} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDetails;
