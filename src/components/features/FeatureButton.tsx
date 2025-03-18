
import React from 'react';
import { cn } from "@/lib/utils";

interface FeatureButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FeatureButton = ({ active, onClick, children }: FeatureButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full transition-all duration-300",
        "hover:bg-emerald/20 hover:text-emerald",
        active ? "bg-emerald/20 text-emerald" : "text-slate-400"
      )}
    >
      {children}
    </button>
  );
};

export default FeatureButton;
