"use client";

import { useEffect } from "react";

/**
 * Loads a stylesheet (the Noto Sans TC CJK web font from Google Fonts) without
 * blocking first paint. The <link> is injected on mount rather than
 * server-rendered, so it is never in the render-blocking critical path and
 * there is no hydration mismatch. Google serves the font as unicode-range
 * subsets, so only the few subsets a page actually uses are fetched
 * (display=swap renders system CJK first, then swaps Noto in).
 */
export default function FontLink({ href }: { href: string }) {
  useEffect(() => {
    if (document.querySelector(`link[data-fontlink="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-fontlink", href);
    document.head.appendChild(link);
  }, [href]);

  return null;
}
