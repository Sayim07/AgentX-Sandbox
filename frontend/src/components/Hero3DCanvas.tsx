import React, { useEffect, useRef } from "react";

export const Hero3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse interactive coordinates
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 3D Particles & Node Grid Data
    const numParticles = 65;
    const particles: {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
    }[] = [];

    const colors = ["#00F0FF", "#00FF9D", "#3B82F6", "#A855F7"];

    for (let i = 0; i < numParticles; i++) {
      const x = (Math.random() - 0.5) * width * 1.5;
      const y = (Math.random() - 0.5) * height * 1.5;
      const z = Math.random() * 800 + 100;
      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      // Smooth lerp mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;
      const mouseOffsetX = (mouse.x - cx) * 0.3;
      const mouseOffsetY = (mouse.y - cy) * 0.3;

      const projected: { x: number; y: number; scale: number; color: string }[] = [];

      // Update and project 3D particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (Math.abs(p.x) > width) p.x = -p.x;
        if (Math.abs(p.y) > height) p.y = -p.y;

        const currX = p.x - mouseOffsetX;
        const currY = p.y - mouseOffsetY;
        const currZ = p.z;

        const scale = fov / (fov + currZ);
        const px = cx + currX * scale;
        const py = cy + currY * scale;

        projected.push({ x: px, y: py, scale, color: p.color });

        // Draw node point
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.1, scale * 1.2));
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      // Draw 3D connecting wireframe lines between nearby nodes
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 140) * 0.25;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
