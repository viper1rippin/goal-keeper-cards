
import React from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarLogoutProps {
  collapsed: boolean;
  onLogout: () => void;
}

const SidebarLogout = ({ collapsed, onLogout }: SidebarLogoutProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-slate-300 hover:text-white hover:bg-muted p-2 rounded-lg",
        collapsed && "justify-center"
      )}
      onClick={onLogout}
    >
      <LogOut size={20} className="text-slate-300" />
      {!collapsed && <span className="ml-3">Logout</span>}
    </Button>
  );
};

export default SidebarLogout;
