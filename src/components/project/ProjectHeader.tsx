
import React from 'react';
import { Goal } from '@/components/GoalRow';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProjectHeaderProps {
  project: Goal;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-slate-400 mb-4">{project.description}</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Progress</span>
              <span className="text-sm font-medium text-emerald-400">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectHeader;
