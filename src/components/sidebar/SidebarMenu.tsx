
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home,
  UserRound, 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Sparkles,
  Award,
  Map
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SidebarMenuItem from "./SidebarMenuItem";
import PremiumDialog from "../premium/PremiumDialog";

interface SidebarMenuProps {
  collapsed: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SidebarMenu = ({ collapsed, darkMode, toggleDarkMode }: SidebarMenuProps) => {
  const navigate = useNavigate();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  
  return (
    <>
      <ul className="space-y-2">
        <SidebarMenuItem 
          icon={<Home size={20} />} 
          label="Home" 
          collapsed={collapsed} 
          onClick={() => navigate('/projects')} 
        />
        <SidebarMenuItem 
          icon={<UserRound size={20} />} 
          label="Profile" 
          collapsed={collapsed} 
          onClick={() => navigate('/profile')} 
        />
        <SidebarMenuItem 
          icon={<Award size={20} strokeWidth={1.5} />} 
          label="Progress" 
          collapsed={collapsed} 
          onClick={() => navigate('/progress')} 
        />
        <SidebarMenuItem 
          icon={<Map size={20} strokeWidth={1.5} />} 
          label="Roadmap" 
          collapsed={collapsed} 
          onClick={() => navigate('/roadmap')} 
        />
        <SidebarMenuItem 
          icon={<Palette size={20} strokeWidth={1.5} />} 
          label="Custom Themes" 
          collapsed={collapsed} 
          onClick={() => {}} 
        />
        <SidebarMenuItem 
          icon={darkMode ? <Moon size={20} />: <Sun size={20} />} 
          label={darkMode ? "Night Mode" : "Day Mode"} 
          collapsed={collapsed} 
          onClick={toggleDarkMode} 
          rightElement={
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode} 
              className="ml-auto"
            />
          }
        />
        <SidebarMenuItem 
          icon={<Sparkles size={20} strokeWidth={1.5} />} 
          label="Upgrade" 
          collapsed={collapsed} 
          onClick={() => setIsPremiumDialogOpen(true)}
          highlight
        />
      </ul>
      
      <PremiumDialog 
        open={isPremiumDialogOpen} 
        onOpenChange={setIsPremiumDialogOpen}
      />
    </>
  );
};

export default SidebarMenu;
