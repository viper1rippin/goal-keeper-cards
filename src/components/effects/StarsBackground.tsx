
import React, { useEffect, useRef } from "react";

const StarsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Create stars
    class Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speedOpacity: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.speedOpacity = Math.random() * 0.01;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
      
      update() {
        this.opacity += this.speedOpacity;
        
        if (this.opacity > 0.8 || this.opacity < 0.1) {
          this.speedOpacity = -this.speedOpacity;
        }
        
        this.draw();
      }
    }
    
    // Create array of stars
    const stars: Star[] = [];
    const starCount = Math.min(window.innerWidth * 0.1, 200); // Adjust star count based on screen size
    
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a0a");
      gradient.addColorStop(1, "#111827");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw stars
      stars.forEach(star => star.update());
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full absolute inset-0 z-0"
    />
  );
};

export default StarsBackground;
