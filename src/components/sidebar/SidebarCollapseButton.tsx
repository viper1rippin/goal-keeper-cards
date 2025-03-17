
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarCollapseButtonProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarCollapseButton = ({ collapsed, toggleCollapse }: SidebarCollapseButtonProps) => {
  return (
    <button 
      className="absolute -right-3 top-6 glass-card z-50 p-1 rounded-full border border-border"
      onClick={toggleCollapse}
    >
      {collapsed ? 
        <ChevronRight size={18} className="text-primary" /> : 
        <ChevronLeft size={18} className="text-primary" />
      }
    </button>
  );
};

export default SidebarCollapseButton;
