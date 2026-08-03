export function formatNT(value: number): string {
  return `NT$${Math.round(value).toLocaleString("en-US")}`;
}

export function Money({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return <span className={`money ${className}`}>{formatNT(value)}</span>;
}
