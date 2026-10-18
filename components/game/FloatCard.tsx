import { useId, type CSSProperties, type ReactNode } from "react";

type CardElement = "section" | "div" | "article" | "aside";
type TitleElement = "h2" | "h3" | "h4" | "p";

export interface FloatCardProps {
  children?: ReactNode;
  /** Card title, rendered in the Label style. Labels the card when `as` is a landmark/sectioning element. */
  title?: ReactNode;
  /** Element for the title. Default "h2". */
  titleAs?: TitleElement;
  /** Element for the card. Default "section". */
  as?: CardElement;
  /** Extra content on the right of the title row (a hint, a link). */
  aside?: ReactNode;
  /** --card-strong and --shadow-float: today's stop, modals, documents. */
  strong?: boolean;
  /** Run the 7.1 arrival animation. Default true. */
  arrive?: boolean;
  /** Arrival stagger position (0, 1, 2 ...): delay = index × 40ms. */
  index?: number;
  /** Lift 2px on hover (01 §4). Off by default: use it on cards that are clickable. */
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/** Floating glass card over the station (01 §5). Padding 18, radius 18. */
export function FloatCard({
  children,
  title,
  titleAs: Title = "h2",
  as: Element = "section",
  aside,
  strong = false,
  arrive = true,
  index = 0,
  lift = false,
  className,
  style,
  id,
}: FloatCardProps) {
  const titleId = useId();
  const classes = [
    "g-card",
    strong && "g-card--strong",
    lift && "g-card--lift",
    arrive && "ga-card-in",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const mergedStyle = arrive ? ({ "--ga-i": index, ...style } as CSSProperties) : style;

  return (
    <Element
      id={id}
      className={classes}
      style={mergedStyle}
      aria-labelledby={title && Element !== "div" ? titleId : undefined}
    >
      {title || aside ? (
        <div className="g-card-head">
          {title ? (
            <Title id={titleId} className="g-label g-card-title">
              {title}
            </Title>
          ) : (
            <span />
          )}
          {aside ? <span className="g-caption">{aside}</span> : null}
        </div>
      ) : null}
      {children}
    </Element>
  );
}
