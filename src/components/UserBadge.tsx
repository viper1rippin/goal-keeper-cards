
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface UserBadgeProps {
  level: number;
}

const UserBadge = ({ level }: UserBadgeProps) => {
  const { user, signOut } = useAuth();
  
  const userEmail = user?.email || "User";
  const shortEmail = userEmail.length > 15 
    ? `${userEmail.substring(0, 15)}...` 
    : userEmail;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/30",
            "text-slate-100 rounded-xl flex items-center gap-2 h-auto py-1.5 px-3"
          )}
        >
          <span className="flex items-center justify-center w-6 h-6 bg-emerald rounded-full text-xs font-medium">
            {level}
          </span>
          <span className="text-sm font-medium">{shortEmail}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="flex gap-2 cursor-pointer">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex gap-2 text-red-400 focus:text-red-400 cursor-pointer" 
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserBadge;
