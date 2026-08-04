import type { MetadataRoute } from "next";
import { MODULES } from "@/lib/modules";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/course`, lastModified: now, priority: 0.9 },
    { url: `${siteUrl}/simulation`, lastModified: now, priority: 0.8 },
    { url: `${siteUrl}/signup`, lastModified: now, priority: 0.7 },
    ...MODULES.map((m) => ({
      url: `${siteUrl}/course/${m.number}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
