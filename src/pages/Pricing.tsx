import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Bot } from "lucide-react";
import NavigationBar from '@/components/layout/NavigationBar';
import { useToast } from "@/hooks/use-toast";
import AnimatedContainer from '@/components/AnimatedContainer';
import GridBackground from '@/components/effects/GridBackground';
import { cn } from "@/lib/utils";

type PricingPeriod = 'monthly' | 'yearly' | 'lifetime';

const Pricing = () => {
  const [period, setPeriod] = useState<PricingPeriod>('monthly');
  const { toast } = useToast();

  const handleSubscribe = (planName: string) => {
    toast({
      title: "Coming Soon",
      description: `${planName} subscription will be available soon!`,
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-apple-dark text-white relative">
      <GridBackground />
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-16">
        <AnimatedContainer className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Select the perfect plan that fits your needs and budget
          </p>
          
          <div className="inline-flex items-center bg-slate-900/50 p-1 rounded-lg border border-slate-800 mb-12">
            <Button 
              variant={period === 'monthly' ? 'default' : 'ghost'} 
              onClick={() => setPeriod('monthly')}
              className={period === 'monthly' ? 'bg-emerald text-black' : 'text-slate-400'}
            >
              Monthly
            </Button>
            <Button 
              variant={period === 'yearly' ? 'default' : 'ghost'} 
              onClick={() => setPeriod('yearly')}
              className={period === 'yearly' ? 'bg-emerald text-black' : 'text-slate-400'}
            >
              Yearly
            </Button>
            <Button 
              variant={period === 'lifetime' ? 'default' : 'ghost'} 
              onClick={() => setPeriod('lifetime')}
              className={period === 'lifetime' ? 'bg-emerald text-black' : 'text-slate-400'}
            >
              Lifetime
            </Button>
          </div>
        </AnimatedContainer>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <AnimatedContainer delay={100}>
            <PricingCard
              title="Free"
              description="Basic features for personal use"
              price="$0"
              period="forever"
              features={[
                "Up to 3 parent goals",
                "Up to 5 sub-goals per parent",
                "Basic progress tracking",
                "7-day goal history"
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
              onSubscribe={() => handleSubscribe("Free")}
            />
          </AnimatedContainer>
          
          {/* Premium Plan */}
          <AnimatedContainer delay={200}>
            <PricingCard
              title="Premium"
              description="Advanced features for power users"
              price={period === 'monthly' ? '$4.99' : period === 'yearly' ? '$14.99' : '$49.99'}
              period={period === 'monthly' ? 'month' : period === 'yearly' ? 'year' : 'one-time'}
              features={[
                "Unlimited parent goals",
                "Unlimited sub-goals",
                "Advanced progress tracking",
                "Unlimited goal history",
                "AI Companion",
                "Priority support"
              ]}
              buttonText="Subscribe Now"
              buttonVariant="default"
              highlighted={true}
              onSubscribe={() => handleSubscribe("Premium")}
            />
          </AnimatedContainer>
          
          {/* Team Plan */}
          <AnimatedContainer delay={300}>
            <PricingCard
              title="Team"
              description="Collaboration features for teams"
              price={period === 'monthly' ? '$9.99' : period === 'yearly' ? '$29.99' : '$99.99'}
              period={period === 'monthly' ? 'month' : period === 'yearly' ? 'year' : 'one-time'}
              features={[
                "Everything in Premium",
                "Up to 10 team members",
                "Team goal sharing",
                "Collaborative workflows",
                "Team analytics",
                "Admin controls"
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
              onSubscribe={() => handleSubscribe("Team")}
            />
          </AnimatedContainer>
        </div>
        
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <FaqItem 
              question="Can I switch plans later?" 
              answer="Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account settings." 
            />
            <FaqItem 
              question="Is there a free trial?" 
              answer="We offer a 14-day free trial for all premium features. No credit card required." 
            />
            <FaqItem 
              question="What payment methods do you accept?" 
              answer="We accept all major credit cards, PayPal, and Apple Pay." 
            />
            <FaqItem 
              question="Can I get a refund?" 
              answer="Yes, we offer a 30-day money-back guarantee for all paid plans." 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  highlighted?: boolean;
  onSubscribe: () => void;
}

const PricingCard = ({ 
  title, 
  description, 
  price, 
  period, 
  features, 
  buttonText, 
  buttonVariant,
  highlighted = false,
  onSubscribe 
}: PricingCardProps) => {
  return (
    <Card className={cn(
      "border border-slate-800 bg-slate-900/30 backdrop-blur-sm h-full transition-all duration-300 hover:translate-y-[-5px]",
      highlighted && "border-emerald/30 ring-1 ring-emerald/20 shadow-lg shadow-emerald/5"
    )}>
      <CardHeader className={cn(
        "pb-3",
        highlighted && "bg-gradient-to-r from-emerald/10 to-transparent"
      )}>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          {title}
          {title === "Premium" && <Bot className="ml-2 text-emerald-400 h-5 w-5" />}
        </CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-slate-400 ml-2">/{period}</span>
        </div>
        <ul className="space-y-3 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-emerald mr-2 flex-shrink-0" />
              <span className="text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn(
            "w-full",
            buttonVariant === 'default' ? 'bg-emerald hover:bg-emerald-dark text-black' : 'border-emerald/20 text-emerald hover:border-emerald/40'
          )}
          variant={buttonVariant}
          onClick={onSubscribe}
        >
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  return (
    <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-colors">
      <h3 className="font-medium text-white mb-2">{question}</h3>
      <p className="text-sm text-slate-400">{answer}</p>
    </div>
  );
};

export default Pricing;
