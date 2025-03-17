
import React from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const Index = () => {
  const { loading } = useAuth();
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const isDarkMode = theme === "dark";

  // Show a simple loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center", 
        isDarkMode ? "bg-apple-dark" : "bg-slate-50"
      )}>
        <div className={cn("text-lg", isDarkMode ? "text-white" : "text-slate-800")}>
          Loading your goals...
        </div>
      </div>
    );
  }

  return (
    <IndexPageProvider>
      <div className={cn(
        "min-h-screen flex",
        isDarkMode ? "bg-apple-dark" : "bg-gradient-to-b from-slate-50 to-slate-100"
      )}>
        <Sidebar onCollapseChange={setSidebarCollapsed} />
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
