
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          showFocusTimer={showFocusTimer} 
          setShowFocusTimer={setShowFocusTimer} 
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
