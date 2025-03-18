
import React, { useState } from 'react';
import { Code, MessageCircle, Command, Sparkles } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FeatureButton from './FeatureButton';

const features = [
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    icon: <Code className="w-4 h-4" />,
    image: 'public/lovable-uploads/02764281-cdd9-48da-a994-9bca94be5682.png',
    description: 'Generate new code faster than the speed of thought.'
  },
  {
    id: 'chat',
    title: 'Chat',
    icon: <MessageCircle className="w-4 h-4" />,
    image: 'public/lovable-uploads/242401c8-a442-4126-8972-17f0d7f2b411.png',
    description: 'Talk to our AI that knows your entire codebase, not just your current file.'
  },
  {
    id: 'command',
    title: 'Command',
    icon: <Command className="w-4 h-4" />,
    image: 'public/lovable-uploads/ac7d0b1d-6ef0-4cda-8c84-1305f7f81682.png',
    description: 'Press Ctrl+I or ⌘+I to give natural language instructions in your editor to write and edit code.'
  },
  {
    id: 'supercomplete',
    title: 'Supercomplete',
    icon: <Sparkles className="w-4 h-4" />,
    image: 'public/lovable-uploads/2df78d3a-211c-495d-af0e-90a1045c827e.png',
    description: 'Intent driven suggestions independent of your cursor position.'
  }
];

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  const currentFeature = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="relative py-20">
      {/* Background decorations */}
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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Feature Image */}
        <Card className="overflow-hidden bg-apple-dark border-emerald/10">
          <img
            src={currentFeature.image}
            alt={currentFeature.title}
            className="w-full aspect-video object-cover"
          />
        </Card>

        {/* Feature Selection */}
        <div className="flex flex-wrap justify-center gap-4">
          {features.map((feature) => (
            <FeatureButton
              key={feature.id}
              active={activeFeature === feature.id}
              onClick={() => setActiveFeature(feature.id)}
            >
              <div className="flex items-center gap-2">
                {feature.icon}
                <span>{feature.title}</span>
              </div>
            </FeatureButton>
          ))}
        </div>

        {/* Feature Description */}
        <div className="text-center">
          <p className="text-lg text-slate-300">{currentFeature.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
