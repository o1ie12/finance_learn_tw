import { Icon, type IconName } from "./icons";

export type MoodLevel = "calm" | "tense" | "stressed";

/** The word that always leads the bubble, so color is never the only signal. */
export const MOOD_WORD: Record<MoodLevel, string> = {
  calm: "安心",
  tense: "有點緊張",
  stressed: "壓力很大",
};

const MOOD_ICON: Record<MoodLevel, IconName> = {
  calm: "check",
  tense: "info",
  stressed: "close",
};

export interface MoodBubbleProps {
  /** calm → --good, tense → --warn, stressed → --bad. */
  level: MoodLevel;
  /** Short reason without the leading word, e.g. 有緊急預備金. */
  reason: string;
  className?: string;
}

/**
 * Speech bubble above the character (01 §5, §6.1): 10px dot in the meaning
 * color, an icon, then "安心：有緊急預備金".
 */
export function MoodBubble({ level, reason, className }: MoodBubbleProps) {
  return (
    <p className={["g-mood", `g-mood--${level}`, className].filter(Boolean).join(" ")}>
      <span className="g-mood-dot" aria-hidden="true" />
      <Icon name={MOOD_ICON[level]} size={16} className="g-mood-icon" />
      <span>
        {MOOD_WORD[level]}：{reason}
      </span>
    </p>
  );
}
