import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, X, LogOut, UserCircle } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <aside className={cn(
      "border-r border-slate-800 bg-slate-900 h-screen flex flex-col",
      "transition-all duration-300 z-20",
      isMobile ? (open ? "w-72 absolute inset-y-0 left-0" : "w-0") : "w-16 hover:w-72"
    )}>
      {/* Menu toggle button for mobile */}
      {isMobile && (
        <Button
          onClick={() => setOpen(!open)}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 -right-12 z-20",
            open ? "hidden" : "block"
          )}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}
      
      {/* Close button for mobile sidebar */}
      {isMobile && open && (
        <Button
          onClick={() => setOpen(false)}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      
      <div className={cn(
        "flex-1 flex flex-col px-2 pt-5 pb-4 overflow-y-auto",
        isMobile && !open && "hidden"
      )}>
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <img 
            className="h-8 w-auto" 
            src="/placeholder.svg" 
            alt="Logo" 
          />
          <span className={cn(
            "ml-3 font-semibold text-xl text-white transition-opacity duration-300",
            isMobile ? "" : "opacity-0 group-hover:opacity-100"
          )}>
            Zodiac
          </span>
        </div>
        
        <nav className="flex-1 space-y-1 mt-5">
          <NavLink 
            to="/"
            className={({ isActive }) => cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition",
              isActive 
                ? "bg-emerald/10 text-emerald"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <svg className="h-5 w-5 mr-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>  <path d="M5 12l-2 0l9 -9l9 9l-2 0" />  <path d="M5 12c0 2.5 4 7 9 7s9 -4.5 9 -7" /></svg>
            <span className={cn(
              "transition-opacity duration-300",
              isMobile ? "" : "opacity-0 group-hover:opacity-100"
            )}>
              Dashboard
            </span>
          </NavLink>
          
          <NavLink 
            to="/projects/test-project"
            className={({ isActive }) => cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition",
              isActive 
                ? "bg-emerald/10 text-emerald"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <svg className="h-5 w-5 mr-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>  <path d="M9 3l0 7l3 -3l3 3l0 -7" />  <path d="M15 13l0 7l-3 -3l-3 3l0 -7" />  <path d="M6 13l0 7l-3 -3l-3 3l0 -7" /></svg>
            <span className={cn(
              "transition-opacity duration-300",
              isMobile ? "" : "opacity-0 group-hover:opacity-100"
            )}>
              Projects
            </span>
          </NavLink>
          
          {/* User section in sidebar */}
          {user && (
            <div className="mt-auto pt-4 border-t border-slate-800">
              <NavLink 
                to="/profile"
                className={({ isActive }) => cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition",
                  isActive 
                    ? "bg-emerald/10 text-emerald"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <UserCircle className="h-5 w-5 mr-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isMobile ? "" : "opacity-0 group-hover:opacity-100"
                )}>
                  Profile Settings
                </span>
              </NavLink>
              
              <button
                onClick={signOut}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <LogOut className="h-5 w-5 mr-4" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isMobile ? "" : "opacity-0 group-hover:opacity-100"
                )}>
                  Logout
                </span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
