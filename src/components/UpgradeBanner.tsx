
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Infinity, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UpgradeBanner: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-4 bg-gradient-to-r from-emerald/10 to-blue-600/10 border-emerald/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              You've reached your free plan limit
            </h3>
            <p className="text-slate-300 text-sm">
              Upgrade to Premium to create unlimited goals and sub-goals
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            onClick={() => navigate('/profile')}
          >
            <Star className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-emerald" />
          <span className="text-slate-300 text-sm">Unlimited goals</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-emerald" />
          <span className="text-slate-300 text-sm">Unlimited sub-goals</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-emerald" />
          <span className="text-slate-300 text-sm">Patriot badge</span>
        </div>
      </div>
    </Card>
  );
};
