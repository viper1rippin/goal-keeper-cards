
import React, { useEffect, useState } from "react";
import { IndexPageProvider } from "@/components/index/IndexPageContext";
import GoalsContent from "@/components/index/GoalsContent";
import DialogManager from "@/components/index/DialogManager";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string; delay: string }>>([]);
  const [waves, setWaves] = useState<Array<{ id: number; left: string; top: string; size: string }>>([]);

  // Create gold dust particles effect for light mode
  useEffect(() => {
    if (theme === 'light') {
      // Generate random gold dust particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`
      }));
      
      // Generate subtle ocean waves
      const newWaves = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${50 + Math.random() * 100}px`
      }));
      
      setParticles(newParticles);
      setWaves(newWaves);
    } else {
      setParticles([]);
      setWaves([]);
    }
  }, [theme]);

  // Show a simple loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-foreground text-lg">Loading your goals...</div>
      </div>
    );
  }

  return (
    <IndexPageProvider>
      <div className="min-h-screen flex bg-background">
        {/* Gold dust particles for light mode only */}
        {theme === 'light' && (
          <>
            {particles.map(particle => (
              <div 
                key={`particle-${particle.id}`}
                className="gold-dust-particle"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.delay
                }}
              />
            ))}
            
            {/* Subtle ocean waves */}
            {waves.map(wave => (
              <div 
                key={`wave-${wave.id}`}
                className="ocean-wave"
                style={{
                  left: wave.left,
                  top: wave.top,
                  width: wave.size,
                  height: wave.size
                }}
              />
            ))}
          </>
        )}
        
        <Sidebar onCollapseChange={setSidebarCollapsed} />
        <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
          <div className="flex-1 flex flex-col items-center">
            <GoalsContent />
          </div>
          <Footer />
          <DialogManager />
        </div>
      </div>
    </IndexPageProvider>
  );
};

export default Index;
