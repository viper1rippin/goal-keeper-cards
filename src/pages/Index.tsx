
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Show a simple loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-dark">
        <div className="text-white text-lg">Loading your goals...</div>
      </div>
    );
  }

  return (
    <IndexPageProvider>
      <div className="min-h-screen flex bg-apple-dark">
        <Sidebar />
        <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
          <div className="flex-1 flex flex-col items-center">
            <GoalsContent />
          </div>
          <Footer />
          <DialogManager />
        </div>
      </div>
    </IndexPageProvider>
  );
};

export default Index;
