import type { MetadataRoute } from "next";
import { LINES } from "@/lib/lines";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/lines`, lastModified: now, priority: 0.9 },
    { url: `${siteUrl}/signup`, lastModified: now, priority: 0.7 },
  ];

  const linePages: MetadataRoute.Sitemap = LINES.flatMap((line) => [
    { url: `${siteUrl}/line/${line.slug}`, lastModified: now, priority: 0.9 },
    ...(line.sim.ready
      ? [
          {
            url: `${siteUrl}/line/${line.slug}/simulation`,
            lastModified: now,
            priority: 0.8,
          },
        ]
      : []),
    ...line.stationModules.map((n) => ({
      url: `${siteUrl}/line/${line.slug}/course/${n}`,
      lastModified: now,
      priority: 0.8,
    })),
  ]);

  return [...base, ...linePages];
}
