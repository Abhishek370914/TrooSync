"use client";

import { useEffect, useRef } from "react";

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", resize);

    // Particles
    const COLORS = ["#00f5ff", "#a855f7", "#ff00ff", "#38bdf8", "#c084fc"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    // Orbiting orbs
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.006;

      // Big glowing orbs
      const cx = w * 0.65;
      const cy = h * 0.45;

      // Outer glow backdrop
      const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
      grad1.addColorStop(0, "rgba(168,85,247,0.12)");
      grad1.addColorStop(0.5, "rgba(0,245,255,0.06)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Left glow
      const grad2 = ctx.createRadialGradient(w * 0.2, h * 0.5, 0, w * 0.2, h * 0.5, 250);
      grad2.addColorStop(0, "rgba(0,245,255,0.08)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Main center orb
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      rg.addColorStop(0,   "rgba(168,85,247,0.9)");
      rg.addColorStop(0.4, "rgba(0,180,255,0.6)");
      rg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalAlpha = 0.85 + Math.sin(t * 1.5) * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, 90 + Math.sin(t) * 6, 0, Math.PI * 2);
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.restore();

      // Orbiting small orbs
      const orb1x = cx + Math.cos(t * 0.8) * 140;
      const orb1y = cy + Math.sin(t * 0.8) * 60;
      const rg2 = ctx.createRadialGradient(orb1x, orb1y, 0, orb1x, orb1y, 35);
      rg2.addColorStop(0, "rgba(0,245,255,1)");
      rg2.addColorStop(1, "rgba(0,245,255,0)");
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(t * 2) * 0.2;
      ctx.beginPath();
      ctx.arc(orb1x, orb1y, 28 + Math.sin(t * 1.5) * 4, 0, Math.PI * 2);
      ctx.fillStyle = rg2;
      ctx.fill();
      ctx.restore();

      const orb2x = cx + Math.cos(t * 0.6 + Math.PI) * 170;
      const orb2y = cy + Math.sin(t * 0.6 + Math.PI) * 80;
      const rg3 = ctx.createRadialGradient(orb2x, orb2y, 0, orb2x, orb2y, 28);
      rg3.addColorStop(0, "rgba(255,0,255,1)");
      rg3.addColorStop(1, "rgba(255,0,255,0)");
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(t * 1.8 + 1) * 0.2;
      ctx.beginPath();
      ctx.arc(orb2x, orb2y, 22 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
      ctx.fillStyle = rg3;
      ctx.fill();
      ctx.restore();

      // Connection lines
      const drawLine = (x1: number, y1: number, x2: number, y2: number, col: string) => {
        const alpha = 0.2 + Math.sin(t * 2) * 0.12;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      };
      drawLine(cx, cy, orb1x, orb1y, "#00f5ff");
      drawLine(cx, cy, orb2x, orb2y, "#ff00ff");

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(t + p.x) * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Glowing ring around center orb
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(t * 1.2) * 0.05;
      ctx.strokeStyle = "#00f5ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140 + Math.sin(t * 0.8) * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.08 + Math.sin(t * 0.9 + 1) * 0.04;
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 190 + Math.sin(t * 0.7) * 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
