
import React, { useEffect, useState } from 'react';

const GlowingCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none w-[150px] h-[150px] z-50"
      style={{
        left: position.x - 75,
        top: position.y - 75,
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 40%, transparent 70%)',
        filter: 'blur(4px)',
        transform: 'translate3d(0, 0, 0)',
      }}
    />
  );
};

export default GlowingCursor;
