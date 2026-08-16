/**
 * A small original train-front silhouette — not modeled on any real transit
 * operator's rolling stock or livery. Used as a lightweight motif on
 * immersive panels; entirely static unless the caller adds the pulse class.
 */
export default function TrainGlyph({
  color = "currentColor",
  size = 20,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="11" rx="5" fill={color} />
      <rect x="6.5" y="9" width="4.5" height="3.5" rx="1" fill="#151a21" opacity="0.85" />
      <rect x="13" y="9" width="4.5" height="3.5" rx="1" fill="#151a21" opacity="0.85" />
      <circle cx="7.5" cy="18.5" r="1.6" fill={color} />
      <circle cx="16.5" cy="18.5" r="1.6" fill={color} />
    </svg>
  );
}
