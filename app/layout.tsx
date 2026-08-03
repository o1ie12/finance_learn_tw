import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_TC, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// CJK font: no small subset exists, so skip preload and swap in on load.
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "起薪站 — 給台灣高中生的免費理財課",
    template: "%s ｜ 起薪站",
  },
  description:
    "起薪站是一套專為台灣高中生設計的免費理財課程與模擬體驗：五個模組帶你搞懂消費心理、預算、複利、銀行信用與台股，再用「第一份薪水模擬」練習真實的財務選擇。",
  applicationName: "起薪站",
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
  authors: [{ name: "起薪站" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "起薪站",
    title: "起薪站 — 給台灣高中生的免費理財課",
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
      className={`${spaceGrotesk.variable} ${notoSansTC.variable} ${ibmPlexMono.variable} h-full`}
    >
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
