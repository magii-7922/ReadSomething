"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Planet = {
  orbit: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
};

export function SolarSystemBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "day") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const planets: Planet[] = [
      { orbit: 0.12, size: 3, speed: 0.0009, phase: 0.2, color: "#c4a882" },
      { orbit: 0.18, size: 4.5, speed: 0.00065, phase: 1.4, color: "#e8b86d" },
      { orbit: 0.26, size: 5, speed: 0.00045, phase: 2.8, color: "#7a9e7e" },
      { orbit: 0.34, size: 4, speed: 0.00032, phase: 0.9, color: "#c47a5c" },
      { orbit: 0.44, size: 8, speed: 0.0002, phase: 4.1, color: "#d4a574" },
      { orbit: 0.54, size: 7, speed: 0.00014, phase: 5.2, color: "#c9b896" },
      { orbit: 0.64, size: 5.5, speed: 0.0001, phase: 1.1, color: "#8eb4c4" },
      { orbit: 0.74, size: 5, speed: 0.00008, phase: 3.3, color: "#6a8fbf" },
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Soft warm wash so planets sit in sunlight haze
      const wash = ctx.createRadialGradient(
        w * 0.72,
        h * 0.28,
        0,
        w * 0.72,
        h * 0.28,
        Math.max(w, h) * 0.85,
      );
      wash.addColorStop(0, "rgba(255, 220, 140, 0.22)");
      wash.addColorStop(0.45, "rgba(255, 200, 100, 0.08)");
      wash.addColorStop(1, "rgba(255, 180, 80, 0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.72;
      const cy = h * 0.28;
      const base = Math.min(w, h);

      // Orbital rings
      for (const p of planets) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, base * p.orbit, base * p.orbit * 0.62, -0.25, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(180, 130, 60, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Sun
      const sunR = base * 0.055;
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3.2);
      sunGlow.addColorStop(0, "rgba(255, 236, 160, 0.95)");
      sunGlow.addColorStop(0.35, "rgba(255, 190, 70, 0.55)");
      sunGlow.addColorStop(1, "rgba(255, 160, 40, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 3.2, 0, Math.PI * 2);
      ctx.fill();

      const sunCore = ctx.createRadialGradient(cx - sunR * 0.2, cy - sunR * 0.2, 0, cx, cy, sunR);
      sunCore.addColorStop(0, "#fff6c8");
      sunCore.addColorStop(0.55, "#ffc94a");
      sunCore.addColorStop(1, "#e89a20");
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Planets on tilted elliptical orbits
      for (const p of planets) {
        const angle = t * p.speed + p.phase;
        const rx = base * p.orbit;
        const ry = base * p.orbit * 0.62;
        const ex = Math.cos(angle) * rx;
        const ey = Math.sin(angle) * ry;
        const tilt = -0.25;
        const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
        const y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(x - p.size * 0.25, y - p.size * 0.25, p.size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
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
  return <canvas ref={canvasRef} className="solar-system-bg" aria-hidden />;
}
