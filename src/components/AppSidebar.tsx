
import React from "react";
import { 
  LayoutDashboard, 
  Target, 
  BarChart, 
  Zap, 
  Settings, 
  Plus,
  PanelLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useIndexPage } from "./index/IndexPageContext";

// Main navigation items
const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    title: "Goals Overview",
    icon: Target,
    path: "/goals"
  },
  {
    title: "Progress Analytics",
    icon: BarChart,
    path: "/analytics"
  },
  {
    title: "Focus Mode",
    icon: Zap,
    path: "/focus"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];

export const SidebarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        {children}
      </div>
    </SidebarProvider>
  );
};

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCreateOrEditGoal } = useIndexPage();
  const { state } = useSidebar();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="glass-card-emerald border-r border-emerald/10"
    >
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-emerald/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-emerald" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald animate-emerald-pulse" />
          </div>
          <h3 className="ml-3 font-semibold text-lg tracking-tight text-gradient">
            GoalTracker
          </h3>
        </div>
        <SidebarTrigger className="text-slate-400 hover:bg-slate-800/20" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">MAIN NAVIGATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)} 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className="hover:bg-emerald/10 data-[active=true]:bg-emerald/10 data-[active=true]:text-emerald"
                  >
                    <item.icon className="text-slate-400 group-hover:text-emerald" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-6">
        <Button 
          onClick={() => handleCreateOrEditGoal(null)}
          className="w-full shadow-md shadow-emerald/5 hover-scale"
        >
          <Plus className="mr-2 h-4 w-4" />
          {state === "expanded" ? "Add New Goal" : "Add"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
