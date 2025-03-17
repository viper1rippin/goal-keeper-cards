
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Infinity, Star, Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getCardGradient } from "../GoalCardGradients";

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
      icon: <Infinity className="w-10 h-10 text-emerald-light" />
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

  // Use the same gradient function used for goal cards
  const dialogGradient = getCardGradient("Premium");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-emerald/10 bg-gradient-to-br from-apple-dark to-slate-950 rounded-xl overflow-hidden shadow-lg shadow-emerald/5 animate-scale-in relative">
        {/* Subtle animated glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-emerald-dark/10 opacity-30 animate-emerald-pulse pointer-events-none"></div>
        
        {/* Depth-enhancing gradient overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
            zIndex: 0,
          }}
        />
        
        <DialogHeader className="relative z-10">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-20 pointer-events-none">
            <Sparkles className="w-32 h-32 text-emerald-light" />
          </div>
          <DialogTitle className="text-2xl bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent font-bold pb-1">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Unlock powerful features to supercharge your productivity
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-6 relative z-10">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 group transition-all duration-300 hover:translate-x-1">
              <div className="glass-card-emerald rounded-lg p-2 flex-shrink-0 group-hover:shadow-md group-hover:shadow-emerald/10 transition-all duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-emerald-light transition-colors duration-200">{feature.title}</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-200">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="relative z-10">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
          >
            Maybe Later
          </Button>
          <Button 
            className={cn(
              "bg-gradient-to-r from-emerald to-emerald-light text-black font-semibold hover:opacity-90 relative overflow-hidden group"
            )}
            onClick={handleUpgrade}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
