
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  children: React.ReactNode;
  animation?: 'fade-in' | 'scale-in' | 'slide-up' | 'fade-in-delayed';
}

const AnimatedContainer = ({
  children,
  delay = 0,
  animation = 'fade-in',
  className,
  ...props
}: AnimatedContainerProps) => {
  return (
    <div
      className={cn(
        `animate-${animation}`,
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
