'use client';

import { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
}

export default function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Create snowflakes (reduced number for gentle effect)
    const snowflakes: Snowflake[] = [];
    const numberOfSnowflakes = Math.floor((window.innerWidth * window.innerHeight) / 20000); // Reduced for better performance

    for (let i = 0; i < numberOfSnowflakes; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 2, // Larger snowflakes (2-4.5px)
        speed: Math.random() * 0.5 + 0.3, // Gentle falling speed
        drift: Math.random() * 0.3 - 0.15, // Subtle side-to-side drift
        opacity: Math.random() * 0.3 + 0.6, // Higher opacity (0.6-0.9)
      });
    }

    // Animation
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      // Throttle animation to prevent performance issues
      const deltaTime = currentTime - lastTime;
      if (deltaTime < 33) { // ~30fps cap for better performance
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((flake) => {
        // Update position first
        flake.y += flake.speed;
        flake.x += flake.drift;

        // Reset snowflake when it goes off screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }

        // Draw with subtle appearance
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
        
        // Add subtle stroke
        ctx.strokeStyle = `rgba(240, 245, 250, ${flake.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(performance.now());

    // Handle window resize with throttling
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const oldWidth = canvas.width;
        setCanvasSize();
        
        // Redistribute snowflakes across new width
        snowflakes.forEach((flake) => {
          if (canvas.width > oldWidth) {
            // Window expanded - spread snowflakes proportionally
            flake.x = (flake.x / oldWidth) * canvas.width;
          } else {
            // Window shrunk - keep snowflakes if they fit, otherwise reposition
            if (flake.x > canvas.width) {
              flake.x = Math.random() * canvas.width;
            }
          }
        });
        
        // Add more snowflakes if window got bigger
        const newTargetCount = Math.floor((canvas.width * canvas.height) / 20000);
        while (snowflakes.length < newTargetCount) {
          snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2.5 + 2,
            speed: Math.random() * 0.5 + 0.3,
            drift: Math.random() * 0.3 - 0.15,
            opacity: Math.random() * 0.3 + 0.6,
          });
        }
        
        // Remove excess snowflakes if window got smaller
        if (snowflakes.length > newTargetCount) {
          snowflakes.splice(newTargetCount);
        }
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
