
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  
  // Add a logout button if the user is logged in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className={cn(
          "glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5",
          isLightMode ? "animate-gold-sparkle" : ""
        )}>
          <div className={cn(
            "rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-foreground font-bold",
            isLightMode 
              ? "bg-gradient-to-r from-gold-dark to-gold-light" 
              : "bg-gradient-to-r from-gold-dark to-gold-light"
          )}>
            {level}
          </div>
          <span className="text-foreground truncate max-w-[100px]">
            {user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/profile")} 
          className="h-8 px-2"
          title="Profile"
        >
          <User size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()} 
          className="h-8 px-2"
          title="Logout"
        >
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className={cn(
      "glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5",
      isLightMode ? "animate-gold-sparkle" : ""
    )}>
      <div className={cn(
        "rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-foreground font-bold",
        isLightMode 
          ? "bg-gradient-to-r from-gold-dark to-gold-light" 
          : "bg-gradient-to-r from-gold-dark to-gold-light"
      )}>
        {level}
      </div>
      <span className="text-foreground">Guest</span>
    </div>
  );
};

export default UserBadge;
