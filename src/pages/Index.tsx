
import React from 'react';
import GlowingCursor from '@/components/effects/GlowingCursor';
import GridBackground from '@/components/effects/GridBackground';
import IndexHeader from '@/components/index/IndexHeader';
import GoalsContent from '@/components/index/GoalsContent';
import DialogManager from '@/components/index/DialogManager';
import { IndexPageProvider } from '@/components/index/IndexPageContext';

const Index = () => {
  return (
    <IndexPageProvider>
      <div className="min-h-screen bg-apple-dark text-white relative overflow-hidden">
        <GlowingCursor />
        <GridBackground />
        <div className="relative z-10">
          <IndexHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="glass-card-dark rounded-xl p-6 mb-8 backdrop-blur-sm">
              <GoalsContent />
            </div>
          </main>
        </div>
        <DialogManager />
      </div>
    </IndexPageProvider>
  );
};

export default Index;
