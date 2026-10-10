import type { Metadata } from "next";
import { Chiron_GoRound_TC } from "next/font/google"; // 只保留用到的字體
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const display = Chiron_GoRound_TC({
  variable: "--font-display",
  subsets: ["latin"], // 保持 latin 即可，Next.js 會自動處理
  weight: ["500", "700"],
});

const body = Chiron_GoRound_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const accent = Chiron_GoRound_TC({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "看閒書",
  description: "個人書評、影評、遊戲評賞與演出評賞集合體，含打卡表與願望清單。",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const dynamic = "force-dynamic";

// 修正型別，使用標準的 children 型別
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-Hant"
      data-theme="day"
      className={`${display.variable} ${body.variable} ${accent.variable} h-full`}
    >
      {/* 把字體變數也加到 body 上 */}
      <body className={`${display.variable} ${body.variable} ${accent.variable} min-h-full`}>
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