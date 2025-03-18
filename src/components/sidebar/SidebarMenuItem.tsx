
import React from "react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  rightElement?: React.ReactNode;
  highlight?: boolean;
}

const SidebarMenuItem = ({ 
  icon, 
  label, 
  collapsed, 
  onClick, 
  rightElement, 
  highlight 
}: MenuItemProps) => {
  return (
    <li>
      <button
        className={cn(
          "flex items-center w-full p-2 rounded-lg hover:bg-muted transition-colors",
          highlight ? "text-emerald-400" : "text-slate-300 hover:text-white"
        )}
        onClick={onClick}
      >
        <span className={cn(
          "flex items-center justify-center",
          highlight && "text-emerald-400"
        )}>
          {icon}
        </span>
        {!collapsed && (
          <div className="flex items-center w-full ml-3">
            <span className={cn(
              "transition-all",
              highlight && "text-emerald-400 font-medium"
            )}>{label}</span>
            {rightElement}
          </div>
        )}
      </button>
    </li>
  );
};

export default SidebarMenuItem;
