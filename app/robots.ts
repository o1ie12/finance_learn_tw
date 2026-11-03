import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** 11 DOM-1: crawl the public pages; keep out of the signed-in app and the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dev/", "/today", "/status", "/map", "/moves", "/settings", "/turn", "/onboarding/", "/line/*/station/", "/line/*/end", "/line/*/bonus/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
