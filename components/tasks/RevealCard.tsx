import { useId, type CSSProperties } from "react";
import { Icon } from "@/components/game/icons";
import s from "./tasks.module.css";

/**
 * The bias reveal (01 §6.5 panel 4): names the bias behind the student's
 * choice, then the text the server picked (lib/tasks/reveal.ts).
 */
export function RevealCard({ bias, text, index = 0 }: { bias: string; text: string; index?: number }) {
  const titleId = useId();
  return (
    <section
      className={`g-card g-card--strong ga-card-in ${s.revealCard}`}
      style={{ "--ga-i": index } as CSSProperties}
      aria-labelledby={titleId}
    >
      <p className="g-label">為什麼會這樣選</p>
      <h3 id={titleId} className={`g-question ${s.revealTitle}`}>
        <Icon name="info" size={22} className={s.revealIcon} />
        <span>你剛剛的選擇，背後是「{bias}」</span>
      </h3>
      <p className={s.bodyText}>{text}</p>
    </section>
  );
}
