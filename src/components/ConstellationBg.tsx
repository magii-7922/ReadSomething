"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Star = { x: number; y: number; r: number; twinkle: number };

export function ConstellationBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "night") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    const links: [number, number][] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      }));
      links.length = 0;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140 && Math.random() > 0.62) links.push([i, j]);
        }
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(126, 184, 201, 0.28)";
      ctx.lineWidth = 1;
      for (const [a, b] of links) {
        ctx.beginPath();
        ctx.moveTo(stars[a].x, stars[a].y);
        ctx.lineTo(stars[b].x, stars[b].y);
        ctx.stroke();
      }
      for (const star of stars) {
        const alpha = 0.55 + Math.sin(t * 0.001 + star.twinkle) * 0.35;
        ctx.fillStyle = `rgba(220, 232, 245, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
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

  if (theme !== "night") return null;
  return <canvas ref={canvasRef} className="constellation-bg" aria-hidden />;
}
