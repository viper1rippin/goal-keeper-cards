
import { SubGoalTimelineItem } from './types';

export const getSampleRoadmapData = (): SubGoalTimelineItem[] => {
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  
  return [
    {
      id: "sample-1",
      title: "New Product Research",
      description: "Market analysis and competitor research",
      row: 0,
      start: 0,
      startDate: new Date(currentDate.getTime()).toISOString(),
      endDate: new Date(currentDate.getTime() + 14 * oneDay).toISOString(),
      progress: 100,
      color: "amber"
    },
    {
      id: "sample-2",
      title: "UI/UX Design",
      description: "User interface and experience design",
      row: 0,
      start: 2,
      startDate: new Date(currentDate.getTime() + 15 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 29 * oneDay).toISOString(),
      progress: 70,
      color: "blue"
    },
    {
      id: "sample-3",
      title: "Alpha Release",
      description: "First alpha version milestone",
      row: 0,
      start: 4,
      startDate: new Date(currentDate.getTime() + 30 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 37 * oneDay).toISOString(),
      progress: 0,
      color: "purple"
    },
    {
      id: "sample-4",
      title: "Backend Development",
      description: "API and database development",
      row: 1,
      start: 1,
      startDate: new Date(currentDate.getTime() + 7 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 28 * oneDay).toISOString(),
      progress: 50,
      color: "emerald"
    },
    {
      id: "sample-5",
      title: "Mobile App MVP",
      description: "Core features for mobile platform",
      row: 1,
      start: 4,
      startDate: new Date(currentDate.getTime() + 30 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 44 * oneDay).toISOString(),
      progress: 0,
      color: "pink"
    },
    {
      id: "sample-6",
      title: "Web App Development",
      description: "Frontend development for the web platform",
      row: 2,
      start: 3,
      startDate: new Date(currentDate.getTime() + 21 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 42 * oneDay).toISOString(),
      progress: 30,
      color: "orange"
    },
    {
      id: "sample-7",
      title: "Infrastructure Setup",
      description: "Cloud infrastructure and CI/CD pipeline",
      row: 2,
      start: 0,
      startDate: new Date(currentDate.getTime()).toISOString(),
      endDate: new Date(currentDate.getTime() + 21 * oneDay).toISOString(),
      progress: 90,
      color: "red"
    },
    {
      id: "sample-8",
      title: "Beta Release",
      description: "Public beta launch",
      row: 1,
      start: 6,
      startDate: new Date(currentDate.getTime() + 45 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 52 * oneDay).toISOString(),
      progress: 0,
      color: "purple"
    },
    {
      id: "sample-9",
      title: "Testing & QA",
      description: "Quality assurance and bug fixing",
      row: 2,
      start: 6,
      startDate: new Date(currentDate.getTime() + 43 * oneDay).toISOString(),
      endDate: new Date(currentDate.getTime() + 57 * oneDay).toISOString(),
      progress: 0,
      color: "blue"
    }
  ];
};
