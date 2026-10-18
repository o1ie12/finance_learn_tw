import { AnimatedNumber } from "./AnimatedNumber";
import { formatWith, type NumberFormat } from "./format";

export interface MoneyStatProps {
  /** Caption label above the number, e.g. 月收入. */
  caption: string;
  value: number;
  /** Formatter preset. Default "money" (NT$32,000). */
  format?: NumberFormat;
  /** Name of the line the value comes from, e.g. 職涯線. */
  sourceLine: string;
  /** The value is a default, not the student's own: caption becomes "預設值，完成 X線 後更新". */
  standIn?: boolean;
  /** Count old → new and flash on change (AnimatedNumber). Default false. */
  animate?: boolean;
  className?: string;
}

/** Caption + Card number + source line caption (01 §5). */
export function MoneyStat({
  caption,
  value,
  format = "money",
  sourceLine,
  standIn = false,
  animate = false,
  className,
}: MoneyStatProps) {
  return (
    <div className={["g-money", className].filter(Boolean).join(" ")}>
      <span className="g-caption">{caption}</span>
      <span className="g-card-number">
        {animate ? <AnimatedNumber value={value} format={format} /> : formatWith(format, value)}
      </span>
      <span className="g-caption">{standIn ? `預設值，完成 ${sourceLine} 後更新` : `來自 ${sourceLine}`}</span>
    </div>
  );
}
