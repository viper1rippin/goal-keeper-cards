import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NavigationBar = () => {
  const { user } = useAuth();

  return (
    <div className="w-full bg-black py-4 px-6 sticky top-0 z-50 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-emerald text-2xl font-bold">Loyde</span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-slate-800 text-slate-200">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 w-[400px] bg-apple-dark border border-slate-800">
                  {[
                    { title: 'Parent Goals', description: 'Set and track your main objectives' },
                    { title: 'Sub-Goals', description: 'Break down complex goals into manageable sub-tasks' },
                    { title: 'Mind Map', description: 'Visualize your goals and their relationships' },
                    { title: 'Project Notes', description: 'Keep detailed notes for each project' },
                    { title: 'AI Companion', description: 'Get smart suggestions and insights from our AI assistant' },
                  ].map((item) => (
                    <li key={item.title} className="hover:bg-slate-800/50 p-3 rounded-md">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/"
                          className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors"
                        >
                          <div className="text-lg font-medium text-emerald">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-slate-400">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-slate-800 text-slate-200">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4 bg-apple-dark border border-slate-800">
                  {[
                    { title: 'Documentation', href: '/' },
                    { title: 'Tutorials', href: '/' },
                    { title: 'API Reference', href: '/' },
                  ].map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className="block select-none space-y-1 rounded-md p-3 hover:bg-slate-800/50 leading-none no-underline outline-none transition-colors"
                        >
                          <div className="text-sm font-medium leading-none text-slate-200">{item.title}</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/pricing" className="text-slate-200 hover:text-emerald px-4 py-2 inline-flex items-center">
                Pricing
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/projects">
              <Button 
                size="sm"
                className="bg-emerald hover:bg-emerald-dark"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-200 hover:bg-slate-800">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  size="sm"
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
