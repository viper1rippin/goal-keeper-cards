
import { useEffect, useRef, useState } from "react";

interface GoalCardGlowProps {
  isMouseInCard: boolean;
  isActiveFocus: boolean;
  mousePos: { x: number; y: number };
  isLightMode?: boolean;
}

const GoalCardGlow = ({ isMouseInCard, isActiveFocus, mousePos, isLightMode = false }: GoalCardGlowProps) => {
  if (!isMouseInCard || !isActiveFocus) return null;
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        width: '80px',
        height: '80px',
        transform: 'translate(-50%, -50%)',
        background: isLightMode
          ? 'radial-gradient(circle, rgba(253, 169, 126, 0.25) 0%, rgba(255, 226, 159, 0.15) 40%, transparent 80%)'
          : 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 40%, transparent 80%)',
        borderRadius: '50%',
        zIndex: 1,
        mixBlendMode: 'soft-light',
        filter: 'blur(12px)',
        opacity: 0.7,
      }}
    />
  );
};

export default GoalCardGlow;
