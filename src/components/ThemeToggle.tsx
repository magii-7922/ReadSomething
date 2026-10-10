"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === "day" ? "切換為夜模式" : "切換為日模式"}
    >
      {theme === "day" ? "夜空" : "日間"}
    </button>
  );
}
