import type { Metadata } from "next";
import { Caveat, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const display = Noto_Serif_TC({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = Noto_Sans_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const accent = Caveat({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "又看了什麼啦",
  description: "個人書評、影評、遊戲評與活動評手賬站，含打卡表與願望清單。",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      data-theme="day"
      className={`${display.variable} ${body.variable} ${accent.variable} h-full`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <SiteAtmosphere />
          <div className="site-shell">
            <SiteHeader />
            <main className="page">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
