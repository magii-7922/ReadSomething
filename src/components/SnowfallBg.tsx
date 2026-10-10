"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Flake = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
};

export function SnowfallBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "day") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let flakes: Flake[] = [];

    const makeFlakes = (w: number, h: number) => {
      const count = Math.min(120, Math.floor((w * h) / 14000));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 3.2,
        speed: 0.35 + Math.random() * 1.1,
        drift: 0.2 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.35 + Math.random() * 0.55,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      makeFlakes(canvas.width, canvas.height);
    };

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Soft lavender-blue atmospheric wash
      const wash = ctx.createRadialGradient(w * 0.35, h * 0.15, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.8);
      wash.addColorStop(0, "rgba(230, 220, 255, 0.35)");
      wash.addColorStop(0.45, "rgba(190, 210, 245, 0.12)");
      wash.addColorStop(1, "rgba(170, 200, 240, 0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      for (const f of flakes) {
        f.y += f.speed;
        f.x += Math.sin(t * 0.001 + f.phase) * f.drift;
        if (f.y > h + 8) {
          f.y = -8;
          f.x = Math.random() * w;
        }
        if (f.x < -8) f.x = w + 8;
        if (f.x > w + 8) f.x = -8;

        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.2);
        g.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
        g.addColorStop(0.45, `rgba(230, 235, 255, ${f.opacity * 0.55})`);
        g.addColorStop(1, "rgba(200, 210, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, f.opacity + 0.15)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  if (theme !== "day") return null;
  return <canvas ref={canvasRef} className="snowfall-bg" aria-hidden />;
}
