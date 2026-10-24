import type { CSSProperties } from "react";
import type { LineMeta } from "@/lib/lines";

/** Relative luminance of a #rrggbb color (WCAG 2.x). */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const INK = "#15202b"; // --ink (light), app/tokens.css

/**
 * The per-line custom properties a wrapper sets (06 E2.1): --line, the chip
 * text --line-ink (the line's lineInk override, else colorInk), and --line-on,
 * text drawn on the line color itself (white, or ink for the two light lines
 * where white fails, E2.5c). --line-soft is derived in CSS.
 */
export function lineVars(line: Pick<LineMeta, "color" | "colorInk" | "lineInk">): CSSProperties {
  const on = ratio("#ffffff", line.color) >= ratio(INK, line.color) ? "#ffffff" : INK;
  return {
    "--line": line.color,
    "--line-ink": line.lineInk ?? line.colorInk,
    "--line-on": on,
  } as CSSProperties;
}
