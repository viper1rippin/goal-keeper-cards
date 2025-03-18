import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Code2, BadgeCheck } from "lucide-react";
import AnimatedContainer from '@/components/AnimatedContainer';
import GridBackground from '@/components/effects/GridBackground';
import GlowingCursor from '@/components/effects/GlowingCursor';
import FeatureShowcase from '@/components/features/FeatureShowcase';
import NavigationBar from '@/components/layout/NavigationBar';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-apple-dark text-white relative overflow-hidden">
      <GlowingCursor />
      <GridBackground />
      
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 pt-20 pb-24">
          <AnimatedContainer className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Create Goals and Track Progress with AI
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of goal tracking with our AI-powered platform. Set, track, and achieve your goals with unparalleled efficiency.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/guest">
                <Button 
                  size="lg"
                  className="bg-emerald hover:bg-emerald-600"
                >
                  Start Planning
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-emerald/20 hover:border-emerald/40"
              >
                Learn More
              </Button>
            </div>
          </AnimatedContainer>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-16">
          <AnimatedContainer delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StatsCard icon={<Star />} title="4.9/5" subtitle="User Rating" />
            <StatsCard icon={<Code2 />} title="10K+" subtitle="Active Users" />
            <StatsCard icon={<BadgeCheck />} title="99.9%" subtitle="Success Rate" />
          </AnimatedContainer>
        </div>

        {/* Feature Showcase */}
        <AnimatedContainer delay={600}>
          <FeatureShowcase />
        </AnimatedContainer>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <AnimatedContainer delay={400} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="AI-Powered Tracking"
              description="Leverage artificial intelligence to track and optimize your progress automatically."
              className="glass-card"
            />
            <FeatureCard
              title="Smart Goals"
              description="Set SMART goals with our intelligent goal-setting framework."
              className="glass-card-emerald"
            />
            <FeatureCard
              title="Real-time Analytics"
              description="Get instant insights into your performance and progress."
              className="glass-card"
            />
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
  <div className="text-center p-6 rounded-lg glass-card">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-emerald/10 text-emerald">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
    <p className="text-slate-400">{subtitle}</p>
  </div>
);

const FeatureCard = ({ title, description, className }: { title: string, description: string, className?: string }) => (
  <div className={`p-6 rounded-lg hover-scale ${className}`}>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </div>
);

export default Landing;
