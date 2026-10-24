import type { Brief } from "@/lib/tasks/types";
import { Chip } from "./Bits";
import s from "./ui.module.css";

/**
 * 06 F3.1: the brief as a message. A 40px avatar with the sender's initial,
 * their name, their role and organisation as a chip, the message in the
 * voice font, then 你會學到, 你要做的 and the time. Names are fictional.
 */
export function MessageCard({ brief, headingId }: { brief: Brief; headingId?: string }) {
  const { from } = brief;
  return (
    <section className={`${s.card} ${s.cardLine} squircle`} aria-labelledby={headingId}>
      <div className={s.msgHead}>
        <span className={s.avatar} aria-hidden="true">
          {[...from.name][0]}
        </span>
        <div className={s.msgWho}>
          <p className={s.msgName}>{from.name}</p>
          <Chip>
            {from.org} · {from.role}
          </Chip>
        </div>
      </div>
      <h2 id={headingId} className={s.msgText} data-screen-heading tabIndex={-1}>
        {brief.message}
      </h2>
      <dl className={s.msgRows}>
        <div>
          <dt className={s.label}>你會學到</dt>
          <dd>{brief.learn}</dd>
        </div>
        <div>
          <dt className={s.label}>你要做的</dt>
          <dd>{brief.do}</dd>
        </div>
      </dl>
      <div className={s.msgFoot}>
        <Chip>約 {brief.minutes} 分鐘</Chip>
        <span className={s.fineInline}>名稱皆為虛構。</span>
      </div>
    </section>
  );
}
