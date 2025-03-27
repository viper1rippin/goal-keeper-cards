
import React, { useState } from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import AnimatedContainer from "@/components/AnimatedContainer";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

const IndexPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <IndexPageProvider>
      <div className="flex min-h-screen">
        <Sidebar onCollapseChange={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <AnimatedContainer className="flex-1 container mx-auto px-4 py-8">
            <GoalsContent />
            <DialogManager />
          </AnimatedContainer>
          <Footer />
        </div>
      </div>
    </IndexPageProvider>
  );
};

export default IndexPage;
