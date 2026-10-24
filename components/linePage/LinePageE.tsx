"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MetroRide } from "@/components/transition/MetroRide";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/icons";
import { Sheet, SheetClose } from "@/components/ui/Sheet";
import type { LinePage } from "@/content/linePages";
import s from "./lineE.module.css";

export interface StationRow {
  key: string;
  code: string;
  name: string;
  learn: string | null;
  does: string | null;
  minutes: number | null;
  status: "done" | "current" | "next";
  href?: string;
  terminal?: boolean;
  /** The last station is a scenario (終點模擬); false: it shows as a station (06 G5). */
  scenario?: boolean;
  meta?: string;
}

export interface LinePageData {
  slug: string;
  name: string;
  enName: string;
  code: string;
  color: string;
  promise: string;
  facts: string[];
  /** The line's key numbers on the header's board (verified ones only), else its facts. */
  board: { label: string; value: string }[];
  next: { name: string; code: string; href: string } | null;
  done: number;
  total: number;
  /** The line's last station is a scenario (終點模擬). */
  scenario: boolean;
  signedIn: boolean;
  certificate: { earned: boolean; href: string };
  snippet: string | null;
  interview: LinePage["interview"];
  skills: string[];
  unlocks: { text: string; on: boolean } | null;
  tests: { title: string; body: string; href: string; link: string }[];
  stations: StationRow[];
  optional: StationRow[];
  library: { key: string; title: string; minutes: number; href: string }[];
  libraryTitle: string;
  branches: { key: string; title: string; href: string }[];
  intro?: LinePage["intro"];
}

type Panel = "cert" | "snippet" | "interview";
const PANELS: { id: Panel; title: string; icon: IconName }[] = [
  { id: "cert", title: "完成證書", icon: "award" },
  { id: "snippet", title: "學習紀錄用語", icon: "doc" },
  { id: "interview", title: "面試小提示", icon: "chat" },
];
const DISCLAIMER = "這是學習練習，不是真實的工作經驗。";

/**
 * A line's course page (2026-10-24 redesign): the header with the line's
 * station sign and board, the stations hanging on one continuous line, and a
 * glass panel with progress, 上車 (through the tap-in gate), skills and
 * achievements. Same data as before (progress, terminal, tests, optional
 * stations, 加碼任務, 支線).
 */
export function LinePageE({ d }: { d: LinePageData }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [riding, setRiding] = useState(false);
  const pct = d.total ? d.done / d.total : 0;

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <nav className={s.crumbs} aria-label="位置">
          <Link href={d.signedIn ? "/map" : "/lines"}>路線圖</Link>
          <Icon name="chevron" size={14} />
          <span>{d.name}</span>
        </nav>

        <header className={`${s.card} ${s.head}`}>
          <div className={s.headText}>
            <span className={s.kicker}>
              <span className={s.badge}>{d.code}</span>
              {d.enName.toUpperCase()} · {d.total} 站{d.scenario ? " · 含終點模擬" : ""}
            </span>
            <h1 className={s.h1}>{d.name}</h1>
            <p className={s.promise}>{d.promise}</p>
            <ul className={s.facts}>
              {d.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className={s.headArt}>
            <div className={s.sign}>
              <span className={s.signStripe} aria-hidden="true" />
              <div>
                <div className={s.signKicker}>{d.next ? `下一站 NEXT · ${d.next.code}` : "已走完 ALL DONE"}</div>
                <div className={s.signName}>{d.next?.name ?? d.name}</div>
              </div>
            </div>
            <dl className={s.board}>
              {d.board.map((b) => (
                <div key={b.label}>
                  <dt>{b.label}</dt>
                  <dd>{b.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {d.intro ? (
          // F3.7: a real practitioner, captioned, never autoplayed or required.
          <video className={s.video} controls preload="none" src={d.intro.videoUrl}>
            <track kind="captions" srcLang="zh-Hant" src={d.intro.captionsUrl} default />
          </video>
        ) : null}

        <div className={s.cols}>
          <section className={s.main} aria-label="站點">
            <ol className={`${s.card} ${s.stations}`}>
              {d.stations.map((st, i) => (
                <StationItem key={st.key} st={st} first={i === 0} last={i === d.stations.length - 1} traveled={i < d.done} reached={i <= d.done && i > 0} />
              ))}
            </ol>
            {d.optional.length ? (
              <>
                <h2 className={s.h2}>想多讀一點（不強制）</h2>
                <ol className={`${s.card} ${s.stations}`}>
                  {d.optional.map((st, i) => (
                    <StationItem key={st.key} st={st} first={i === 0} last={i === d.optional.length - 1} traveled={false} reached={false} />
                  ))}
                </ol>
              </>
            ) : null}
            {d.library.length ? (
              <>
                <h2 className={s.h2}>
                  {d.libraryTitle} <small>不影響進度</small>
                </h2>
                <div className={s.extras}>
                  {d.library.map((l) => (
                    <Link key={l.key} href={l.href} className={`${s.card} ${s.extra}`}>
                      <span>{l.title}</span>
                      <small>約 {l.minutes} 分鐘</small>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
            {d.branches.length ? (
              <>
                <h2 className={s.h2}>
                  支線 <small>想多知道一點</small>
                </h2>
                <div className={s.extras}>
                  {d.branches.map((b) => (
                    <Link key={b.key} href={b.href} className={`${s.card} ${s.extra}`}>
                      <span>{b.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          <aside className={s.aside} aria-label="你的進度">
            <div className={s.progressHead}>
              <span>你的進度</span>
              <b>
                {d.done} / {d.total} 站
              </b>
            </div>
            <div className={s.route} role="img" aria-label={`${d.name}：完成 ${d.done} / ${d.total} 站`}>
              <span className={s.routeTrack} />
              <span className={s.routeDone} style={{ width: `calc((100% - 20px) * ${pct})` }} />
            </div>
            {d.signedIn ? (
              d.next ? (
                <Button onClick={() => setRiding(true)}>上車：{d.next.name}</Button>
              ) : (
                <Button href={d.stations[0]?.href ?? `/line/${d.slug}`} variant="secondary">
                  再走一次
                </Button>
              )
            ) : (
              <Button href="/signup">免費上車</Button>
            )}
            <div className={s.rule} />
            <div className={s.label}>學到的技能</div>
            <div className={s.skills}>
              {d.skills.map((k) => (
                <span key={k}>{k}</span>
              ))}
            </div>
            {PANELS.map((p) => (
              <button key={p.id} type="button" className={s.panelBtn} onClick={() => setPanel(p.id)} aria-haspopup="dialog">
                <span className={s.panelIcon} aria-hidden="true">
                  <Icon name={p.id === "cert" && !d.certificate.earned ? "lock" : p.icon} size={20} />
                </span>
                <span className={s.panelText}>
                  <span>{p.title}</span>
                  <small>
                    {p.id === "cert" ? (d.certificate.earned ? "已拿到，點開查看" : `走完 ${d.total} 站`) : p.id === "snippet" ? "用做過的內容寫成一段" : "3 個問題和回答方向"}
                  </small>
                </span>
                <Icon name="chevron" size={18} />
              </button>
            ))}
            {d.unlocks ? (
              <p className={s.unlock}>
                <Icon name={d.unlocks.on ? "check" : "lock"} size={16} />
                <span>
                  {d.unlocks.on ? "已在人生模擬解鎖：" : "走完解鎖人生模擬的："}
                  {d.unlocks.text}
                </span>
              </p>
            ) : null}
            {d.tests.map((t) => (
              <Link key={t.href} href={t.href} className={s.test}>
                <b>{t.title}</b>
                <span>{t.body}</span>
                <span className={s.testLink}>{t.link} →</span>
              </Link>
            ))}
          </aside>
        </div>
      </div>

      {riding && d.next ? (
        <MetroRide
          color={d.color}
          lineName={d.name}
          enName={d.enName.toUpperCase()}
          station={d.next.name}
          code={d.next.code}
          onClose={() => setRiding(false)}
          onDone={() => router.push(d.next!.href)}
        />
      ) : null}

      {panel ? (
        <Sheet label={PANELS.find((p) => p.id === panel)!.title} onClose={() => setPanel(null)}>
          <div className={s.sheet}>
            <h2 className={s.sheetTitle}>{PANELS.find((p) => p.id === panel)!.title}</h2>
            {panel === "cert" ? (
              <>
                <p className={s.body}>
                  {d.certificate.earned ? `${d.name}完成證書上有走過的每一站和模擬結果。` : "走完這條線的必經站，就會拿到完成證書。"}
                </p>
                <p className={s.fine}>{DISCLAIMER}</p>
                {d.certificate.earned ? <Button href={d.certificate.href}>查看證書</Button> : null}
              </>
            ) : null}
            {panel === "snippet" ? (
              <>
                {d.snippet ? (
                  <blockquote className={s.quote}>{d.snippet}</blockquote>
                ) : (
                  <p className={s.body}>完成這條線的任務後，這裡會用做過的內容寫出一段可以改寫的文字。</p>
                )}
                {/* TODO-VERIFY (D3): not confirmed that an online self-study record
                    counts as a 學習歷程 多元表現 item (VERIFIED.md item 9). */}
                <p className={s.fine}>可以改寫成自己的話。能不能放進學習歷程檔案，請先問學校的老師。{DISCLAIMER}</p>
              </>
            ) : null}
            {panel === "interview" ? (
              <ol className={s.qa}>
                {d.interview.map((q) => (
                  <li key={q.q}>
                    <p className={s.q}>{q.q}</p>
                    <p className={s.body}>{q.a}</p>
                  </li>
                ))}
              </ol>
            ) : null}
            <SheetClose />
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

const STATUS_WORD: Record<StationRow["status"], string> = { done: "已完成", current: "下一站", next: "還沒去" };

function StationItem({ st, first, last, traveled, reached }: { st: StationRow; first: boolean; last: boolean; traveled: boolean; reached: boolean }) {
  const inner = (
    <>
      <span className={s.dotCol} aria-hidden="true">
        <span className={s.dot} data-state={st.status} data-terminal={st.terminal || undefined}>
          {st.status === "done" ? <Icon name="check" size={14} /> : null}
        </span>
      </span>
      <span className={s.rowMain}>
        <span className={s.rowHead}>
          <span className={s.code}>{st.code}</span>
          <span className={s.rowName}>{st.name}</span>
          <span className={s.state} data-state={st.status} data-terminal={st.terminal || undefined}>
            {st.terminal && st.scenario !== false && st.status !== "done" ? "終點模擬" : STATUS_WORD[st.status]}
          </span>
        </span>
        {st.learn ? <span className={s.rowLine}>{st.learn}</span> : null}
        {st.does ? <span className={s.rowDo}>{st.does}</span> : null}
      </span>
      <span className={s.mins}>
        <b>{st.meta ?? (st.minutes ? String(st.minutes) : "")}</b>
        {st.minutes && !st.meta ? <small>分鐘</small> : null}
      </span>
    </>
  );
  return (
    <li className={s.station}>
      {/* the line through the dot: above it (from the last stop), below it (to the next) */}
      {!first ? <span className={s.lineUp} data-on={reached || undefined} aria-hidden="true" /> : null}
      {!last ? <span className={s.lineDown} data-on={traveled || undefined} aria-hidden="true" /> : null}
      {st.href ? (
        <Link href={st.href} className={s.row} aria-current={st.status === "current" ? "step" : undefined}>
          {inner}
          <span className="sr-only">{STATUS_WORD[st.status]}</span>
        </Link>
      ) : (
        <div className={s.row}>{inner}</div>
      )}
    </li>
  );
}
