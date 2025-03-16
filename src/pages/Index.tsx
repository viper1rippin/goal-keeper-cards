
import React from "react";
import Header from "@/components/Header";
import GoalRow from "@/components/GoalRow";
import AnimatedContainer from "@/components/AnimatedContainer";

// Sample data for our goals
const goalData = [
  {
    title: "Financial Independence",
    description: "Steps to achieve financial stability and growth",
    goals: [
      {
        title: "Emergency Fund",
        description: "Save 6 months of expenses for emergencies",
        progress: 75
      },
      {
        title: "Debt Reduction",
        description: "Pay off all high-interest debt",
        progress: 60
      },
      {
        title: "Investment Portfolio",
        description: "Diversify investments for long-term growth",
        progress: 45
      },
      {
        title: "Retirement Planning",
        description: "Maximize contributions to retirement accounts",
        progress: 30
      }
    ]
  },
  {
    title: "Professional Development",
    description: "Advance career and build professional skills",
    goals: [
      {
        title: "New Certification",
        description: "Complete advanced industry certification",
        progress: 100
      },
      {
        title: "Networking",
        description: "Attend 2 industry conferences this year",
        progress: 50
      },
      {
        title: "Skill Building",
        description: "Learn a new programming language",
        progress: 85
      },
      {
        title: "Publication",
        description: "Publish 2 articles in industry journals",
        progress: 10
      }
    ]
  },
  {
    title: "Health & Wellness",
    description: "Improve physical and mental wellbeing",
    goals: [
      {
        title: "Exercise Routine",
        description: "Establish consistent weekly workout schedule",
        progress: 90
      },
      {
        title: "Nutrition",
        description: "Meal planning and balanced diet",
        progress: 65
      },
      {
        title: "Mental Health",
        description: "Practice daily meditation and mindfulness",
        progress: 40
      },
      {
        title: "Sleep Quality",
        description: "Improve sleep habits and environment",
        progress: 70
      }
    ]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-apple-dark">
      <Header />
      
      <main className="flex-1 py-10 px-6 sm:px-8 md:px-12 lg:px-16">
        <AnimatedContainer className="max-w-7xl mx-auto mb-12">
          <div className="glass-card p-6 rounded-lg border border-slate-800/80 mb-12">
            <h2 className="text-lg font-medium mb-1">Welcome back, John</h2>
            <p className="text-slate-400">Track your progress and stay focused on your goals.</p>
          </div>
          
          {goalData.map((rowData, index) => (
            <GoalRow
              key={index}
              title={rowData.title}
              description={rowData.description}
              goals={rowData.goals}
              index={index}
            />
          ))}
        </AnimatedContainer>
      </main>
      
      <footer className="py-6 px-6 sm:px-8 md:px-12 lg:px-16 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>John's App © {new Date().getFullYear()} · Progress Tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
