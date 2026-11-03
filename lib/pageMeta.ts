import type { Metadata } from "next";

/**
 * 11 META-1, DOM-1: a public page's own title, description, canonical and
 * share card. Next replaces openGraph and twitter whole when a page sets
 * them, so every page goes through here and keeps the share image.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const shareTitle = `${title} | 錢途 Finline`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      siteName: "錢途 Finline",
      title: shareTitle,
      description,
      url: path,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "錢途 Finline：理財，一站一站學。" }],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: ["/og.png"] },
  };
}
