"use client";

import { ConstellationBg } from "@/components/ConstellationBg";
import { DotGridBg } from "@/components/DotGridBg";
import { useTheme } from "@/components/ThemeProvider";

/** Site-wide atmosphere: constellation (night) or dot grid (day). */
export function SiteAtmosphere() {
  const { theme } = useTheme();
  return theme === "night" ? <ConstellationBg /> : <DotGridBg />;
}
