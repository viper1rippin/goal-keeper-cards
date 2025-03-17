
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Infinity, Star, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-[500px] border border-slate-800 bg-apple-dark rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient font-bold">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Unlock powerful features to supercharge your productivity
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="glass-card rounded-lg p-2 flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button 
            className={cn(
              "bg-gradient-to-r from-gold-400 to-amber-600 text-black font-semibold hover:opacity-90"
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
