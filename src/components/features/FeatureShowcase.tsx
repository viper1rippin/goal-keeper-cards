
import React from 'react';
import { Goal, SubGoal, Network, FileText, Circle, Star } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FeatureShowcase = () => {
  const features = [
    { icon: <Goal />, title: 'Goal Tracking', color: 'emerald' },
    { icon: <SubGoal />, title: 'Sub-Goals', color: 'blue' },
    { icon: <Network />, title: 'Mind Map', color: 'purple' },
    { icon: <FileText />, title: 'Project Details', color: 'orange' }
  ];

  return (
    <div className="relative py-20">
      {/* Zodiac-style decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central star */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Star className="w-12 h-12 text-emerald/20" />
        </div>
        
        {/* Connection lines */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Diagonal lines */}
            <line x1="20" y1="20" x2="80" y2="80" className="stroke-emerald/10 stroke-2" />
            <line x1="20" y1="80" x2="80" y2="20" className="stroke-emerald/10 stroke-2" />
            {/* Connection circles */}
            <circle cx="20" cy="20" r="2" className="fill-emerald/20" />
            <circle cx="80" cy="80" r="2" className="fill-emerald/20" />
            <circle cx="20" cy="80" r="2" className="fill-emerald/20" />
            <circle cx="80" cy="20" r="2" className="fill-emerald/20" />
          </svg>
        </div>
      </div>

      {/* Features grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className={cn(
              "group relative overflow-hidden p-6 hover-scale glass-card-dark cursor-pointer transition-all",
              "hover:border-emerald/30 hover:shadow-emerald/20 hover:shadow-lg"
            )}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Circle className="absolute -right-4 -top-4 w-16 h-16 text-emerald/10" />
              <Star className="absolute -left-4 -bottom-4 w-12 h-12 text-emerald/5" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-emerald/10 text-emerald">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureShowcase;
