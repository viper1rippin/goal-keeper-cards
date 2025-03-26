
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AnimatedContainer from "@/components/AnimatedContainer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";

const Roadmap: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <AnimatedContainer className="flex-1 overflow-hidden">
          <div className="h-full p-4">
            <RoadmapTimeline />
          </div>
        </AnimatedContainer>
        <Footer />
      </div>
    </div>
  );
};

export default Roadmap;
