import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FontLink from "@/components/FontLink";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Noto Sans TC (CJK) is loaded from Google Fonts at runtime, not self-hosted
// via next/font: Google serves it as small on-demand unicode-range subsets,
// which keeps the critical CSS tiny (self-hosting inlines ~100 @font-face
// rules, ~140KB, into the render-blocking CSS and hurts LCP). See FontLink.
const NOTO_TC_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "起薪線 — 給台灣高中生的免費理財課",
    template: "%s ｜ 起薪線",
  },
  description:
    "起薪線是一套專為台灣高中生設計的免費理財課程與模擬體驗：五個模組帶你搞懂消費心理、預算、複利、銀行信用與台股，再用「第一份薪水模擬」練習真實的財務選擇。",
  applicationName: "起薪線",
  keywords: [
    "理財教育",
    "高中生理財",
    "台灣理財課程",
    "預算",
    "複利",
    "台股",
    "0050",
    "勞退",
    "健保",
  ],
  authors: [{ name: "起薪線" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "起薪線",
    title: "起薪線 — 給台灣高中生的免費理財課",
    description:
      "五個模組加一場「第一份薪水模擬」，用台灣真實的數字學會做財務決定。",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <FontLink href={NOTO_TC_HREF} />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={NOTO_TC_HREF} />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          跳到主要內容
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
