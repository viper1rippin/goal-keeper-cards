
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Infinity, Star, Brain } from "lucide-react";
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
      icon: <Infinity className="w-10 h-10 text-emerald" />
    },
    {
      title: "Patriot Badge",
      description: "Stand out with an exclusive Patriot badge on your profile",
      icon: <Star className="w-10 h-10 text-amber-500" />
    },
    {
      title: "AI Companion",
      description: "Get AI-powered suggestions and advice for your goals and projects",
      icon: <Brain className="w-10 h-10 text-indigo-500" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark/10 to-transparent opacity-30 pointer-events-none" />
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald/5 via-emerald-dark/10 to-emerald/5 rounded-xl blur-xl opacity-50 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Unlock powerful features to supercharge your productivity
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-5 space-y-6 relative z-10">
          {features.map((feature, index) => (
            <AnimatedContainer 
              key={index}
              animation="slide-up"
              delay={150 + index * 100}
              className="flex items-start space-x-4 group hover:translate-x-1 transition-transform duration-300"
            >
              <div className="glass-card-emerald rounded-lg p-3 flex-shrink-0 shadow-md group-hover:shadow-emerald/15 transition-all duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-emerald-light transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            </AnimatedContainer>
          ))}
        </div>
        
        <DialogFooter className="relative z-10 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-800 hover:bg-slate-800 hover:text-white">
            Maybe Later
          </Button>
          <Button 
            className={cn(
              "bg-gradient-to-r from-emerald to-emerald-light text-black font-semibold hover:opacity-90 shadow-md shadow-emerald/20"
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
