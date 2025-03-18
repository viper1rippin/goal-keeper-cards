
import React from 'react';

const GridBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          mask: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)'
        }}
      />
      <div 
        className="absolute inset-0 animate-green-lantern"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default GridBackground;
