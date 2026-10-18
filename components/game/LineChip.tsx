import type { ButtonHTMLAttributes, CSSProperties } from "react";
import type { LineMeta } from "@/lib/lines";

export interface LineChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-pressed"> {
  line: Pick<LineMeta, "name" | "color">;
  /** Short status, e.g. 已完成, 1 / 2 站, 未開通. */
  status: string;
  /** Selected: 2px border in the line color, aria-pressed="true". */
  selected?: boolean;
}

/** Line toggle button for the 路線圖 card, 44px min height (01 §5). Wrap in `.g-linechips` for the 2-column grid. */
export function LineChip({ line, status, selected = false, className, style, type = "button", ...rest }: LineChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={["g-linechip", className].filter(Boolean).join(" ")}
      style={{ "--line-color": line.color, ...style } as CSSProperties}
      {...rest}
    >
      <span className="g-linechip-dot" aria-hidden="true" />
      <span className="g-linechip-name">{line.name}</span>
      <span className="g-linechip-status">{status}</span>
    </button>
  );
}
