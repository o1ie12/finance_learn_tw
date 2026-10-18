/**
 * Pass-through: line pages style themselves on the platform (station flow,
 * restyled line/certificate pages, and the .g-legacy card around pages
 * that still use the original reading layout).
 */
export default function LineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
