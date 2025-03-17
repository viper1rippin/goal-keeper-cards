
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home,
  UserRound, 
  BarChart2, 
  Palette, 
  Moon, 
  Sun, 
  Star 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SidebarMenuItem from "./SidebarMenuItem";

interface SidebarMenuProps {
  collapsed: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SidebarMenu = ({ collapsed, darkMode, toggleDarkMode }: SidebarMenuProps) => {
  const navigate = useNavigate();
  
  return (
    <ul className="space-y-2">
      <SidebarMenuItem 
        icon={<Home size={20} />} 
        label="Home" 
        collapsed={collapsed} 
        onClick={() => navigate('/')} 
      />
      <SidebarMenuItem 
        icon={<UserRound size={20} />} 
        label="Profile" 
        collapsed={collapsed} 
        onClick={() => navigate('/profile')} 
      />
      <SidebarMenuItem 
        icon={<BarChart2 size={20} />} 
        label="Progress" 
        collapsed={collapsed} 
        onClick={() => navigate('/progress')} 
      />
      <SidebarMenuItem 
        icon={<Palette size={20} />} 
        label="Custom Themes" 
        collapsed={collapsed} 
        onClick={() => {}} 
      />
      <SidebarMenuItem 
        icon={darkMode ? <Sun size={20} /> : <Moon size={20} />} 
        label="Night Mode" 
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
        icon={<Star size={20} />} 
        label="Upgrade" 
        collapsed={collapsed} 
        onClick={() => {}}
        highlight
      />
    </ul>
  );
};

export default SidebarMenu;
