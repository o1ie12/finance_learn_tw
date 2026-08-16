import type { ReactNode } from "react";
import WindowMotif from "@/components/mrt/WindowMotif";
import TrainGlyph from "@/components/mrt/TrainGlyph";

/**
 * The shared shell for "full immersive" MRT-themed moments: dashboard,
 * simulation intro/outro, the line-transfer/certificate moment, and the
 * station-transition block after a quiz. Deliberately NOT used on lesson or
 * quiz content screens — those keep only the existing
 * thin color strip plus a small static WindowMotif in the header badge, so
 * dense reading text stays legible.
 *
 * CSS/SVG only: a static window-motif texture plus one small pulsing glyph.
 * Respects prefers-reduced-motion via the global rule in app/globals.css.
 */
export default function PlatformPanel({
  color,
  eyebrow,
  children,
  className = "",
}: {
  color: string;
  eyebrow: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl p-6 text-white sm:p-8 ${className}`}
      style={{
        background: `linear-gradient(135deg, #151a21 0%, color-mix(in srgb, ${color} 20%, #151a21) 100%)`,
        borderTop: `4px solid ${color}`,
      }}
    >
      <WindowMotif opacity={0.05} className="text-white" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <TrainGlyph color={color} className="mrt-pulse" />
          <p
            className="font-display text-sm font-semibold uppercase tracking-widest"
            style={{ color: `color-mix(in srgb, ${color} 60%, white)` }}
          >
            {eyebrow}
          </p>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </section>
  );
}
