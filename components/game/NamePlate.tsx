export interface NamePlateProps {
  /** Character name, rendered as plain text. */
  name: string;
  /** e.g. "22 歲 · 第一份工作". */
  subtitle?: string;
  className?: string;
}

/** Ink plate under the character's feet (01 §5). */
export function NamePlate({ name, subtitle, className }: NamePlateProps) {
  return (
    <div className={["g-nameplate", className].filter(Boolean).join(" ")}>
      <span className="g-nameplate-name">{name}</span>
      {subtitle ? <span className="g-nameplate-sub">{subtitle}</span> : null}
    </div>
  );
}
