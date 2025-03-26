
import React, { useEffect, useRef } from 'react';

const StarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full window size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStars();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Generate stars
    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number; twinkleDirection: number }[] = [];
    
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1
      });
    }
    
    // Draw stars
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Update star twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        
        // Reverse direction if opacity gets too high or low
        if (star.opacity > 0.8 || star.opacity < 0.2) {
          star.twinkleDirection *= -1;
        }
      }
    };
    
    // Animation loop
    let animationId: number;
    
    const animate = () => {
      drawStars();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ background: 'linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 100%)' }}
    />
  );
};

export default StarsBackground;
