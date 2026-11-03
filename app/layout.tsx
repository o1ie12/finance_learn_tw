import type { Metadata, Viewport } from "next";
import { Barlow, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import TourProvider from "@/components/tour/TourProvider";
import FontLink from "@/components/FontLink";
import { SITE_URL } from "@/lib/site";

// 2026-11-03: one type system: Barlow for Latin and numbers (the metro
// signs' face), Noto Sans TC for Chinese. No Inter or Space Grotesk.
const barlowText = Barlow({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

// Taipei Sans TC (the public site's display face) is loaded by the (site)
// and (game) layouts, not here: the Part E shell does not use it.

// 11 META-1: one description everywhere until a page sets its own.
const DESCRIPTION = "錢途是給台灣高中生的免費理財課。12 條路線、54 站，每一站讀一份真的帳單、契約或薪資單，做一個決定。";
const OG_TITLE = "錢途 Finline | 給台灣高中生的免費理財課";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: OG_TITLE,
    template: "%s | 錢途",
  },
  description: DESCRIPTION,
  applicationName: "錢途",
  authors: [{ name: "錢途" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "錢途 Finline",
    title: OG_TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "錢途 Finline：理財，一站一站學。" }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  // 11 UI-2: a six-digit code is not a phone number.
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// 11 META-1: theme-color is the page background (tokens: --paper).
export const viewport: Viewport = { themeColor: "#f2f3f4" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${barlowText.variable} ${ibmPlexMono.variable} h-full`}
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
        {/* Wraps every route group's layout: the tour's replay control
            lives in the site header and in the game shell's settings menu,
            so the engine has to sit above both. Header and footer belong to
            app/(site)/layout.tsx; the game shell (app/(game)) has neither. */}
        <TourProvider>{children}</TourProvider>
      </body>
    </html>
  );
}
