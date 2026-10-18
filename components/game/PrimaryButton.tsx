import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, CSSProperties, ReactNode } from "react";
import { lineButtonBackground } from "@/lib/color";
import type { LineMeta } from "@/lib/lines";

interface CommonProps {
  children: ReactNode;
  /**
   * Paint the button in a line's color. White text always; when the vivid
   * color is under 4.5:1 with white, the line's colorInk is used instead
   * (lib/color.ts lineButtonBackground). Default: --ink.
   */
  line?: Pick<LineMeta, "color" | "colorInk">;
  /** Full width of its container. */
  block?: boolean;
  className?: string;
  style?: CSSProperties;
}

type ButtonVariant = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type LinkVariant = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps | "href"> & { href: string };

export type PrimaryButtonProps = ButtonVariant | LinkVariant;

/** Main call to action: 17px/700 white, radius 12, min height 48 (01 §5). Pass `href` for a link. */
export function PrimaryButton(props: PrimaryButtonProps) {
  const { children, line, block, className, style } = props;
  const classes = ["g-btn", block && "g-btn--block", className].filter(Boolean).join(" ");
  const mergedStyle = (line ? { "--btn-bg": lineButtonBackground(line), ...style } : style) as CSSProperties;

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children: _c, line: _l, block: _b, className: _cn, style: _s, href, ...rest } = props;
    return (
      <Link href={href} className={classes} style={mergedStyle} {...rest}>
        {children}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _c, line: _l, block: _b, className: _cn, style: _s, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} style={mergedStyle} {...rest}>
      {children}
    </button>
  );
}
