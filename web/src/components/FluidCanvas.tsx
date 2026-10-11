import React, { useEffect, useRef } from 'react';
import { useGymStore } from '../store/useGymStore';

export const FluidCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings, profile } = useGymStore();

  const isFemale = profile?.gender === 'female' || settings?.gender === 'female';
  const heatTone = settings?.heatTone || (isFemale ? 'rose' : 'ember');
  const cursorAuraEnabled = settings?.cursorAuraEnabled ?? false; // Default OFF for clean Apple experience with zero lag

  // Color mapper by athlete tone
  const toneMap: Record<string, { r: number; g: number; b: number }> = {
    rose: { r: 224, g: 168, b: 153 }, // Rose Gold (Aurelia)
    ember: { r: 217, g: 161, b: 132 }, // Spartan Amber
    green: { r: 143, g: 163, b: 119 }, // Sage Green
    blue: { r: 127, g: 168, b: 201 }, // Slate Blue
    mono: { r: 220, g: 220, b: 220 }, // Apple Silver
  };

  const activeColor = toneMap[heatTone] || toneMap.rose;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = width / 2;
    let mouseY = height / 3;

    // Instantaneous 1:1 cursor tracking with ZERO lerp drag
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    if (cursorAuraEnabled) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Gentle ambient fluid nodes drifting peacefully in background
    const ambientBlobs = [
      { x: width * 0.2, y: height * 0.3, radius: 280, angle: 0, speed: 0.001 },
      { x: width * 0.8, y: height * 0.4, radius: 340, angle: Math.PI, speed: 0.0008 },
      { x: width * 0.5, y: height * 0.75, radius: 300, angle: Math.PI / 2, speed: 0.0012 },
    ];

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle ambient nodes with user's chosen theme tone
      ambientBlobs.forEach((blob) => {
        blob.angle += blob.speed;
        const curX = blob.x + Math.sin(blob.angle) * 35;
        const curY = blob.y + Math.cos(blob.angle * 0.8) * 25;
        const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, blob.radius);
        grad.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.035)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curX, curY, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. If cursor aura is enabled, draw crisp 1:1 instant highlight in the selected theme color
      if (cursorAuraEnabled) {
        const auraGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 160);
        auraGrad.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.05)`);
        auraGrad.addColorStop(0.5, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.015)`);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (cursorAuraEnabled) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [cursorAuraEnabled, heatTone, activeColor.r, activeColor.g, activeColor.b]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};
