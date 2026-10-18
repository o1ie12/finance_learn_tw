/**
 * Number formatters for the game shell. Presets are strings so a Server
 * Component can choose one and pass it to a Client Component (functions
 * cannot cross that boundary).
 */

export type NumberFormat = "money" | "number" | "percent";

/** NT$32,000 / -NT$1,200. Rounded to whole dollars. */
export function formatMoney(value: number): string {
  const n = Math.round(value);
  const abs = Math.abs(n).toLocaleString("en-US");
  return n < 0 ? `-NT$${abs}` : `NT$${abs}`;
}

/** 1,234 (whole numbers) or 1.2 (one decimal when the value has a fraction). */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

/** 4% (whole percent; the value is already 0 to 100). */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatWith(format: NumberFormat | ((n: number) => string), value: number): string {
  if (typeof format === "function") return format(value);
  if (format === "money") return formatMoney(value);
  if (format === "percent") return formatPercent(value);
  return formatNumber(value);
}
