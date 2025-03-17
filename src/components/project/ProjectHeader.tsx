
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProjectHeaderProps {
  title: string;
  parentTitle?: string;
  progress: number;
  onBack: () => void;
}

const ProjectHeader = ({ title, parentTitle, progress, onBack }: ProjectHeaderProps) => {
  return (
    <header className="w-full bg-slate-900 py-8 px-6 sm:px-8 md:px-12 lg:px-16 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to goals
        </Button>
        
        <div className="space-y-4">
          <div>
            {parentTitle && (
              <div className="text-sm text-slate-400">
                {parentTitle}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">{title}</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Progress value={progress} className="h-2 w-64" />
            <span className="text-sm text-slate-400">{progress}% Complete</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
