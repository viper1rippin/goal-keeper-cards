
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Code2, BadgeCheck, CheckCircle, ListChecks, FileText, Calendar, Sparkles, Layout, Target, Rocket } from "lucide-react";
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
        {/* Removed the emerald glow gradient overlay that was here */}
        <div className="container mx-auto px-4 pt-20 pb-24">
          <AnimatedContainer className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Introducing John's App
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 max-w-2xl mx-auto">
              Planning like never before
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

        {/* Philosophy Section */}
        <div className="container mx-auto px-4 py-16">
          <AnimatedContainer delay={200} className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-3xl font-bold text-white">Our Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="glass-card p-6 rounded-lg">
                <p className="text-lg text-slate-300">Forget rigid squares in tightened spaces</p>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <p className="text-lg text-slate-300">Envision and focus your goals everyday</p>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <p className="text-lg text-slate-300">Flexible personal - it's all yours</p>
              </div>
            </div>
          </AnimatedContainer>
        </div>

        {/* Feature Showcase */}
        <AnimatedContainer delay={600}>
          <FeatureShowcase />
        </AnimatedContainer>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <AnimatedContainer delay={300} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How John's App Empowers You</h2>
          </AnimatedContainer>
          
          <AnimatedContainer delay={400} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Target size={24} />}
              title="Goals"
              description="Design your results"
              className="glass-card"
            />
            <FeatureCard
              icon={<Layout size={24} />}
              title="Sub goals"
              description="Designate your actions"
              className="glass-card-emerald"
            />
            <FeatureCard
              icon={<CheckCircle size={24} />}
              title="Action items"
              description="Lay out the foundation"
              className="glass-card"
            />
            <FeatureCard
              icon={<FileText size={24} />}
              title="Project notes"
              description="Keep the wings flying"
              className="glass-card-emerald"
            />
            <FeatureCard
              icon={<Calendar size={24} />}
              title="Daily Planning"
              description="Everyday is a new way"
              className="glass-card"
            />
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="Your Superpower"
              description="Claim your superpower with John's App now"
              className="glass-card-emerald"
            />
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

        {/* Call to Action */}
        <div className="container mx-auto px-4 py-16">
          <AnimatedContainer delay={500} className="max-w-3xl mx-auto text-center space-y-8 glass-card-emerald p-12 rounded-xl">
            <h2 className="text-3xl font-bold text-white">Ready to transform your planning?</h2>
            <p className="text-xl text-slate-300">Start organizing your goals and tasks like never before.</p>
            <Link to="/guest">
              <Button 
                size="lg"
                className="bg-emerald hover:bg-emerald-600"
              >
                Get Started Now
                <Rocket className="ml-2" size={20} />
              </Button>
            </Link>
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

const FeatureCard = ({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) => (
  <div className={`p-6 rounded-lg hover-scale ${className}`}>
    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-emerald/10 text-emerald">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </div>
);

export default Landing;
