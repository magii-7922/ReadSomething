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
    let w = 0;
    let h = 0;

    const makeFlakes = () => {
      const count = Math.min(140, Math.floor((w * h) / 12000));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 3.2,
        speed: 0.35 + Math.random() * 1.1,
        drift: 0.2 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.5,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeFlakes();
    };

    const draw = (t: number) => {
      // Paint full-viewport sky every frame (no transparent clear → no seam with body)
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#a59bcf");
      sky.addColorStop(0.45, "#8793c6");
      sky.addColorStop(1, "#6d84b6");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const washL = ctx.createRadialGradient(w * 0.22, h * 0.1, 0, w * 0.22, h * 0.1, Math.max(w, h) * 0.55);
      washL.addColorStop(0, "rgba(160, 140, 210, 0.4)");
      washL.addColorStop(1, "rgba(160, 140, 210, 0)");
      ctx.fillStyle = washL;
      ctx.fillRect(0, 0, w, h);

      const washR = ctx.createRadialGradient(w * 0.88, h * 0.75, 0, w * 0.88, h * 0.75, Math.max(w, h) * 0.5);
      washR.addColorStop(0, "rgba(100, 145, 205, 0.35)");
      washR.addColorStop(1, "rgba(100, 145, 205, 0)");
      ctx.fillStyle = washR;
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
