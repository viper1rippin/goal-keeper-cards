import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Goal } from "@/components/GoalRow";
import ProjectHeader from "@/components/project/ProjectHeader";
import ZodiacMindMap from "@/components/project/ZodiacMindMap";
import { ProjectTextEditor } from "@/components/project/ProjectTextEditor";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AnimatedContainer from "@/components/AnimatedContainer";

// Extended Goal type that includes user_id
interface ProjectGoal extends Goal {
  user_id?: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProject({
            id: data.id,
            title: data.title,
            description: data.description,
            progress: data.progress,
            user_id: user.id // Use the current user's ID
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-8">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold text-slate-300 mb-4">Project Not Found</h2>
          <p className="text-slate-400 mb-6">This project doesn't exist or you don't have access to it.</p>
          <Button onClick={handleBackClick}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedContainer animation="fade-in" className="min-h-screen pb-16 bg-slate-950">
      <div className="container py-8">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <ProjectHeader project={project} />
        
        <div className="mt-12">
          <ZodiacMindMap projectId={project.id as string} />
        </div>
        
        {user && (
          <ProjectTextEditor 
            projectId={project.id as string} 
            userId={user.id} 
          />
        )}
      </div>
    </AnimatedContainer>
  );
};

export default ProjectDetails;
