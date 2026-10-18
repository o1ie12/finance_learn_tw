/**
 * Small WCAG 2.x contrast helpers.
 *
 * Used by the game shell to decide whether a line's vivid color can carry
 * white text (PrimaryButton "上車" in the line color). Formula: WCAG 2.2
 * relative luminance and contrast ratio,
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

/** AA threshold for normal-size text. */
export const AA_TEXT = 4.5;

const WHITE = "#ffffff";
/** Fallback when neither line color passes: the shell's --ink token value. */
const INK = "#16202a";

/** Parse #rgb or #rrggbb. Returns null for anything else. */
export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`relativeLuminance: not a hex color: "${hex}"`);
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function passesAA(fg: string, bg: string, min = AA_TEXT): boolean {
  return contrastRatio(fg, bg) >= min;
}

/**
 * Background for white text in a line's color: the vivid `color` when it
 * reaches 4.5:1 against white, else `colorInk`, else ink. Six of the twelve
 * lines need the colorInk step (e.g. 信用線 #F4A300 is 2.1:1 on white).
 */
export function lineButtonBackground(line: { color: string; colorInk: string }): string {
  if (passesAA(WHITE, line.color)) return line.color;
  if (passesAA(WHITE, line.colorInk)) return line.colorInk;
  return INK;
}
