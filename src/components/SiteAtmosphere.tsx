"use client";

import { ConstellationBg } from "@/components/ConstellationBg";
import { SolarSystemBg } from "@/components/SolarSystemBg";
import { useTheme } from "@/components/ThemeProvider";

/** Site-wide atmosphere: constellation (night) or solar system (day). */
export function SiteAtmosphere() {
  const { theme } = useTheme();
  return theme === "night" ? <ConstellationBg /> : <SolarSystemBg />;
}
