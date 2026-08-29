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

// Taipei Sans TC Beta (台北黑體) — the display/header face (section 7 of the
// build spec): open-source, modeled on Taiwanese public signage and transit
// systems, the most on-brand typeface available for this brief. Not on
// Google Fonts, so it's loaded the same deferred way as Noto Sans TC above,
// from the unofficial webfont package https://github.com/vp-tw/taipei-sans-tc
// rather than next/font/local (no font files vendored into the repo).
const TAIPEI_SANS_REGULAR_HREF =
  "https://cdn.jsdelivr.net/npm/@vp-tw/taipei-sans-tc/dist/Regular/TaipeiSansTCBeta-Regular.css";
const TAIPEI_SANS_BOLD_HREF =
  "https://cdn.jsdelivr.net/npm/@vp-tw/taipei-sans-tc/dist/Bold/TaipeiSansTCBeta-Bold.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "起點 — 給台灣高中生的免費理財學習平台",
    template: "%s ｜ 起點",
  },
  description:
    "起點是給台灣高中生的免費理財學習平台。四條「路線」——起薪、存錢、信用、投資——每條都配一套文章課程與一個真實情境模擬，用台灣的規則與數字學會做財務決定。",
  applicationName: "起點",
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
    "證交稅",
  ],
  authors: [{ name: "起點" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "起點",
    title: "起點 — 給台灣高中生的免費理財學習平台",
    description:
      "四條路線，每條都配一套課程與模擬。每條線，都從這裡出發。",
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
        <FontLink href={TAIPEI_SANS_REGULAR_HREF} />
        <FontLink href={TAIPEI_SANS_BOLD_HREF} />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={NOTO_TC_HREF} />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={TAIPEI_SANS_REGULAR_HREF} />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={TAIPEI_SANS_BOLD_HREF} />
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
