
import { SubGoalTimelineItem } from "./types";

export const getSampleRoadmapData = (): SubGoalTimelineItem[] => {
  return [
    {
      id: "item-1",
      title: "Project Planning",
      description: "Initial project planning and requirements gathering",
      progress: 100,
      row: 0,
      start: 0,
      duration: 1,
      category: "milestone"
    },
    {
      id: "item-2",
      title: "UI Design",
      description: "Create wireframes and design system",
      progress: 80,
      row: 1,
      start: 1,
      duration: 2,
      category: "design"
    },
    {
      id: "item-3",
      title: "Frontend Development",
      description: "Implement user interface components",
      progress: 60,
      row: 1,
      start: 3,
      duration: 3,
      category: "development"
    },
    {
      id: "item-4",
      title: "Backend Setup",
      description: "Configure server and database",
      progress: 70,
      row: 2,
      start: 2,
      duration: 2,
      category: "development"
    },
    {
      id: "item-5",
      title: "API Integration",
      description: "Connect frontend to backend services",
      progress: 30,
      row: 2,
      start: 4,
      duration: 3,
      category: "development"
    },
    {
      id: "item-6",
      title: "Testing Phase",
      description: "Unit and integration testing",
      progress: 20,
      row: 0,
      start: 6,
      duration: 2,
      category: "testing"
    },
    {
      id: "item-7",
      title: "Launch Preparation",
      description: "Final polishing and deployment preparation",
      progress: 10,
      row: 0,
      start: 8,
      duration: 2,
      category: "marketing"
    },
    {
      id: "item-8",
      title: "Product Launch",
      description: "Official release",
      progress: 0,
      row: 0,
      start: 10,
      duration: 1,
      category: "milestone"
    }
  ];
};
