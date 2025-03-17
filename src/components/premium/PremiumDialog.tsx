
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Infinity, Star, Brain, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AnimatedContainer from "../AnimatedContainer";

interface PremiumFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PremiumDialog: React.FC<PremiumDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  
  const features: PremiumFeature[] = [
    {
      title: "Unlimited Goals",
      description: "Set and track as many goals and sub-goals as you need without limits",
      icon: <Infinity className="w-6 h-6 text-emerald" />
    },
    {
      title: "Patriot Badge",
      description: "Stand out with an exclusive Patriot badge on your profile",
      icon: <Star className="w-6 h-6 text-amber-500" />
    },
    {
      title: "AI Companion",
      description: "Get AI-powered suggestions and advice for your goals and projects",
      icon: <Brain className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "Team Collaboration",
      description: "Work together with your team members on shared goals and projects",
      icon: <Users className="w-6 h-6 text-blue-500" />
    }
  ];

  const handleUpgrade = () => {
    toast({
      title: "Coming Soon",
      description: "Stripe integration is coming soon! Stay tuned.",
      variant: "default",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-emerald/10 bg-gradient-to-br from-slate-900/90 to-black/95 backdrop-blur-lg rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark/10 to-transparent opacity-20 pointer-events-none" />
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald/5 via-emerald-dark/10 to-emerald/5 rounded-xl blur-xl opacity-40 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-xl bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Unlock powerful features to supercharge your productivity
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-5 relative z-10">
          {features.map((feature, index) => (
            <AnimatedContainer 
              key={index}
              animation="slide-up"
              delay={150 + index * 100}
              className="flex items-start space-x-3 group hover:translate-x-1 transition-transform duration-300"
            >
              <div className="glass-card-emerald rounded-lg p-2 flex-shrink-0 shadow-sm group-hover:shadow-emerald/10 transition-all duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-white group-hover:text-emerald-light transition-colors duration-300">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.description}</p>
              </div>
            </AnimatedContainer>
          ))}
        </div>
        
        <DialogFooter className="relative z-10 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs border-slate-800 hover:bg-slate-800 hover:text-white">
            Maybe Later
          </Button>
          <Button 
            className={cn(
              "text-xs bg-gradient-to-r from-emerald to-emerald-light text-black font-medium hover:opacity-90 shadow-sm shadow-emerald/15"
            )}
            onClick={handleUpgrade}
          >
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
