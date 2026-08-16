"use client";

import { useId } from "react";

/**
 * A static (non-animated) repeating "train window" texture — the one motif
 * shared by both the restrained accent (small, low opacity, in a header bar)
 * and the full-immersive panels (larger). CSS/SVG only, no images.
 */
export default function WindowMotif({
  opacity = 0.08,
  size = 34,
  className = "",
}: {
  opacity?: number;
  size?: number;
  className?: string;
}) {
  const id = useId();
  const patternId = `mrt-windows-${id}`;
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <rect
            x={size * 0.12}
            y={size * 0.18}
            width={size * 0.58}
            height={size * 0.35}
            rx={size * 0.12}
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
