
import { SubGoalTimelineItem } from './types';

export const getSampleRoadmapData = (): SubGoalTimelineItem[] => {
  return [
    {
      id: "sample-1",
      title: "New Product Research",
      description: "Market analysis and competitor research",
      row: 0,
      start: 0,
      duration: 2,
      progress: 100
    },
    {
      id: "sample-2",
      title: "UI/UX Design",
      description: "User interface and experience design",
      row: 0,
      start: 2,
      duration: 2,
      progress: 70
    },
    {
      id: "sample-3",
      title: "Alpha Release",
      description: "First alpha version milestone",
      row: 0,
      start: 4,
      duration: 1,
      progress: 0
    },
    {
      id: "sample-4",
      title: "Backend Development",
      description: "API and database development",
      row: 1,
      start: 1,
      duration: 3,
      progress: 50
    },
    {
      id: "sample-5",
      title: "Mobile App MVP",
      description: "Core features for mobile platform",
      row: 1,
      start: 4,
      duration: 2,
      progress: 0
    },
    {
      id: "sample-6",
      title: "Web App Development",
      description: "Frontend development for the web platform",
      row: 2,
      start: 3,
      duration: 3,
      progress: 30
    },
    {
      id: "sample-7",
      title: "Infrastructure Setup",
      description: "Cloud infrastructure and CI/CD pipeline",
      row: 2,
      start: 0,
      duration: 3,
      progress: 90
    },
    {
      id: "sample-8",
      title: "Beta Release",
      description: "Public beta launch",
      row: 1,
      start: 6,
      duration: 1,
      progress: 0
    },
    {
      id: "sample-9",
      title: "Testing & QA",
      description: "Quality assurance and bug fixing",
      row: 2,
      start: 6,
      duration: 2,
      progress: 0
    }
  ];
};
