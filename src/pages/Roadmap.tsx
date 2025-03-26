
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AnimatedContainer from "@/components/AnimatedContainer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";

const Roadmap: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <AnimatedContainer className="flex-1 overflow-hidden">
          <div className="container mx-auto p-4 h-full">
            <h1 className="text-2xl font-bold mb-6">Roadmap Timeline</h1>
            <RoadmapTimeline />
          </div>
        </AnimatedContainer>
        <Footer />
      </div>
    </div>
  );
};

export default Roadmap;
