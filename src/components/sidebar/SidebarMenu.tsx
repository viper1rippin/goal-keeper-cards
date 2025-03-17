
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home,
  UserRound, 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Star,
  Award
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SidebarMenuItem from "./SidebarMenuItem";
import { SUBSCRIPTION_TIERS } from "@/utils/subscriptionUtils";

interface SidebarMenuProps {
  collapsed: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  subscriptionTier?: string;
}

const SidebarMenu = ({ 
  collapsed, 
  darkMode, 
  toggleDarkMode,
  subscriptionTier = SUBSCRIPTION_TIERS.FREE
}: SidebarMenuProps) => {
  const navigate = useNavigate();
  const isPremium = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM;
  
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
        icon={<Award size={20} />} 
        label="Progress" 
        collapsed={collapsed} 
        onClick={() => navigate('/progress')} 
      />
      <SidebarMenuItem 
        icon={<Palette size={20} />} 
        label={isPremium ? "Custom Themes" : "Themes (Premium)"} 
        collapsed={collapsed} 
        onClick={() => {
          if (isPremium) {
            // Navigate to themes page 
            navigate('/themes');
          } else {
            // Show upgrade modal or navigate to profile
            navigate('/profile');
          }
        }} 
        disabled={!isPremium}
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
      {!isPremium && (
        <SidebarMenuItem 
          icon={<Star size={20} />} 
          label="Upgrade" 
          collapsed={collapsed} 
          onClick={() => navigate('/profile')}
          highlight
        />
      )}
    </ul>
  );
};

export default SidebarMenu;
