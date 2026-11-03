import type { MetadataRoute } from "next";
import { LINES } from "@/lib/lines";
import { SITE_URL } from "@/lib/site";

/**
 * 11 DOM-1: the public pages and the 12 line pages (plus each station's
 * optional article). Nothing that needs a sign-in: no 今天, no stations.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, lastModified: now, priority });
  return [
    page("/", 1),
    page("/lines", 0.9),
    page("/about", 0.6),
    page("/partnerships", 0.4),
    page("/transfer", 0.5),
    page("/signup", 0.7),
    page("/privacy", 0.3),
    page("/terms", 0.3),
    ...LINES.map((line) => page(`/line/${line.slug}`, 0.9)),
    ...LINES.flatMap((line) => line.stationModules.map((n) => page(`/line/${line.slug}/course/${n}?read=1`, 0.5))),
  ];
}
