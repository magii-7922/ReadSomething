"use client";

import { ConstellationBg } from "@/components/ConstellationBg";
import { SnowfallBg } from "@/components/SnowfallBg";
import { useTheme } from "@/components/ThemeProvider";

/** Site-wide atmosphere: constellation (night) or snowfall (day). */
export function SiteAtmosphere() {
  const { theme } = useTheme();
  return theme === "night" ? <ConstellationBg /> : <SnowfallBg />;
}
