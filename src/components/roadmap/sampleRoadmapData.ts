
import { SubGoalTimelineItem } from "./types";

export const getSampleRoadmapData = (): SubGoalTimelineItem[] => {
  return [
    {
      id: "1",
      title: "User Research",
      description: "Conduct interviews and surveys with target users",
      row: 0,
      start: 0,
      duration: 2,
      progress: 100,
      category: "research"
    },
    {
      id: "2",
      title: "Wireframing",
      description: "Create low-fidelity wireframes for key screens",
      row: 0,
      start: 2,
      duration: 1,
      progress: 100,
      category: "design"
    },
    {
      id: "3",
      title: "UI Design",
      description: "Create high-fidelity mockups and design system",
      row: 0,
      start: 3,
      duration: 2,
      progress: 85,
      category: "design"
    },
    {
      id: "4",
      title: "Authentication System",
      description: "Implement user authentication and authorization",
      row: 1,
      start: 1,
      duration: 3,
      progress: 90,
      category: "backend"
    },
    {
      id: "5",
      title: "Database Schema",
      description: "Design and implement database models and relations",
      row: 2,
      start: 0,
      duration: 2,
      progress: 100,
      category: "infrastructure"
    },
    {
      id: "6",
      title: "API Development",
      description: "Build RESTful API endpoints for core features",
      row: 2,
      start: 2,
      duration: 3,
      progress: 70,
      category: "backend"
    },
    {
      id: "7",
      title: "Alpha Release",
      description: "Internal testing milestone",
      row: 1,
      start: 5,
      duration: 1,
      progress: 0,
      category: "milestone"
    },
    {
      id: "8",
      title: "Mobile UI Implementation",
      description: "Develop core UI components for mobile app",
      row: 1,
      start: 6,
      duration: 3,
      progress: 0,
      category: "mobile"
    },
    {
      id: "9",
      title: "Web Dashboard",
      description: "Implement admin dashboard and analytics views",
      row: 0,
      start: 6,
      duration: 4,
      progress: 15,
      category: "web"
    },
    {
      id: "10",
      title: "Integration Testing",
      description: "Test full system integration and fix bugs",
      row: 2,
      start: 7,
      duration: 2,
      progress: 0,
      category: "testing"
    },
    {
      id: "11",
      title: "Beta Release",
      description: "Limited public beta with key users",
      row: 0,
      start: 10,
      duration: 1,
      progress: 0,
      category: "milestone"
    },
    {
      id: "12",
      title: "Performance Optimization",
      description: "Optimize app performance and loading times",
      row: 2,
      start: 9,
      duration: 2,
      progress: 0,
      category: "development"
    }
  ];
};
