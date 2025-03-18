
import React, { useState } from 'react';
import { ListChecks, Network, FileText, Goal } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FeatureButton from './FeatureButton';

const features = [
  {
    id: 'parent-goals',
    title: 'Parent Goals',
    icon: <Goal className="w-4 h-4" />,
    image: '/goals.png',
    description: 'Set and track your main objectives with our intuitive parent goal system.'
  },
  {
    id: 'sub-goals',
    title: 'Sub-Goals',
    icon: <ListChecks className="w-4 h-4" />,
    image: '/subgoals.png',
    description: 'Break down complex goals into manageable sub-tasks for better tracking.'
  },
  {
    id: 'mind-map',
    title: 'Mind Map',
    icon: <Network className="w-4 h-4" />,
    image: '/mindmap.png',
    description: 'Visualize your goals and their relationships with our interactive mind mapping tool.'
  },
  {
    id: 'project-notes',
    title: 'Project Notes',
    icon: <FileText className="w-4 h-4" />,
    image: '/notes.png',
    description: 'Keep detailed notes and documentation for each project and goal.'
  }
];

const FeatureShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFeature = features[currentIndex];

  return (
    <div className="relative py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="20" y1="20" x2="80" y2="80" className="stroke-emerald/10 stroke-2" />
            <line x1="20" y1="80" x2="80" y2="20" className="stroke-emerald/10 stroke-2" />
            <circle cx="20" cy="20" r="2" className="fill-emerald/20" />
            <circle cx="80" cy="80" r="2" className="fill-emerald/20" />
            <circle cx="20" cy="80" r="2" className="fill-emerald/20" />
            <circle cx="80" cy="20" r="2" className="fill-emerald/20" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <Card className="overflow-hidden bg-apple-dark border-emerald/10 aspect-video">
          <div className="relative w-full h-full">
            <div className="absolute inset-8 rounded-lg overflow-hidden shadow-2xl bg-apple-dark">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-200",
                    "rounded-lg overflow-hidden border border-emerald/10",
                    currentIndex === index ? "opacity-100" : "opacity-0"
                  )}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          {features.map((feature, index) => (
            <FeatureButton
              key={feature.id}
              active={currentIndex === index}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="flex items-center gap-2">
                {feature.icon}
                <span>{feature.title}</span>
              </div>
            </FeatureButton>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-slate-300">{currentFeature.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
