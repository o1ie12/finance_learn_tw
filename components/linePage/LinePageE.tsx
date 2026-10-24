"use client";

import Link from "next/link";
import { useState } from "react";
import { Sign } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/Options";
import { Sheet } from "@/components/ui/Sheet";
import type { LinePage } from "@/content/linePages";
import s from "./lineE.module.css";

export interface StationRow {
  key: string;
  name: string;
  learn: string | null;
  does: string | null;
  minutes: number | null;
  status: "done" | "current" | "next";
  href?: string;
  terminal?: boolean;
  meta?: string;
}

export interface LinePageData {
  slug: string;
  name: string;
  sign: { name: string; code: string };
  promise: string;
  facts: string[];
  cta: { href: string; label: string } | null;
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

type Panel = "cert" | "snippet" | "interview" | "skills";
const ACHIEVEMENTS: { id: Panel; title: string; icon: IconName }[] = [
  { id: "cert", title: "證書", icon: "award" },
  { id: "snippet", title: "學習紀錄用語", icon: "doc" },
  { id: "interview", title: "面試小提示", icon: "chat" },
  { id: "skills", title: "學到的技能", icon: "check" },
];

const DISCLAIMER = "這是學習練習，不是真實的工作經驗。";

/**
 * The line page on the Part E design (06 E8.9, F3.5, F3.6): the line's sign,
 * a one-sentence promise, a fact row, the four achievement cards, then the
 * stations with what each teaches and asks. On a phone 「總覽」/「站點」 swap
 * the two halves; on Regular they sit side by side. Reviews are not shown
 * (none exist yet; never fabricate).
 */
export function LinePageE({ d }: { d: LinePageData }) {
  const [half, setHalf] = useState<"overview" | "stations">("overview");
  const [panel, setPanel] = useState<Panel | null>(null);

  return (
    <div className={s.page}>
      <div className={s.seg}>
        <Segmented
          label="這條線"
          items={[
            { id: "overview", label: "總覽" },
            { id: "stations", label: "站點" },
          ]}
          value={half}
          onChange={setHalf}
        />
      </div>
      <div className={s.halves} data-half={half}>
        <section className={s.overview} aria-label="總覽">
          <div className={s.signRow}>
            <Sign name={d.sign.name} code={d.sign.code} />
          </div>
          <p className={s.promise}>{d.promise}</p>
          <ul className={s.facts} aria-label="這條線">
            {d.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {d.intro ? (
            // F3.7: a real practitioner, captioned, never autoplayed or required.
            <video className={s.video} controls preload="none" src={d.intro.videoUrl}>
              <track kind="captions" srcLang="zh-Hant" src={d.intro.captionsUrl} default />
            </video>
          ) : null}
          {d.cta ? <Button href={d.cta.href}>{d.cta.label}</Button> : null}
          {!d.signedIn ? (
            <Button variant="secondary" href="/signup">
              建立帳號
            </Button>
          ) : null}

          <div className={s.achievements}>
            {ACHIEVEMENTS.map((a) => (
              <button key={a.id} type="button" className={s.ach} onClick={() => setPanel(a.id)} aria-haspopup="dialog">
                <span className={s.achIcon} aria-hidden="true">
                  <Icon name={a.id === "cert" && !d.certificate.earned ? "lock" : a.icon} size={20} />
                </span>
                <span className={s.achTitle}>{a.title}</span>
              </button>
            ))}
          </div>

          {d.unlocks ? (
            <div className={s.card}>
              <p className={s.label}>在人生遊戲裡解鎖</p>
              <p className={s.unlock}>
                <Icon name={d.unlocks.on ? "check" : "lock"} size={18} />
                <span>{d.unlocks.text}</span>
              </p>
              <p className={s.fine}>{d.unlocks.on ? "已解鎖：這些行動已經在人生遊戲裡。" : "走完這條線，這些行動會出現在人生遊戲裡。"}</p>
            </div>
          ) : null}

          {d.tests.map((t) => (
            <div key={t.href} className={s.card}>
              <p className={s.cardTitle}>{t.title}</p>
              <p className={s.body}>{t.body}</p>
              <Link href={t.href} className={s.textLink}>
                {t.link}
              </Link>
            </div>
          ))}
        </section>

        <section className={s.stations} aria-label="站點">
          <ol className={s.list} data-list>
            {d.stations.map((st) => (
              <StationItem key={st.key} st={st} />
            ))}
          </ol>
          {d.optional.length ? (
            <>
              <p className={s.groupTitle}>想多讀一點（不強制）</p>
              <ol className={s.list} data-list>
                {d.optional.map((st) => (
                  <StationItem key={st.key} st={st} />
                ))}
              </ol>
            </>
          ) : null}
          {d.library.length ? (
            <>
              <p className={s.groupTitle}>{d.libraryTitle} · 不影響進度</p>
              <ul className={s.list} data-list>
                {d.library.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} className={s.row}>
                      <span className={s.rowMain}>
                        <span className={s.rowName}>{l.title}</span>
                      </span>
                      <span className={s.rowMin}>約 {l.minutes} 分鐘</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {d.branches.length ? (
            <>
              <p className={s.groupTitle}>支線 · 想多知道一點</p>
              <ul className={s.list} data-list>
                {d.branches.map((b) => (
                  <li key={b.key}>
                    <Link href={b.href} className={s.row}>
                      <span className={s.rowMain}>
                        <span className={s.rowName}>{b.title}</span>
                      </span>
                      <Icon name="chevron" size={20} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>

      {panel ? (
        <Sheet label={ACHIEVEMENTS.find((a) => a.id === panel)!.title} onClose={() => setPanel(null)}>
          <div className={s.sheet}>
            <h2 className={s.sheetTitle}>{ACHIEVEMENTS.find((a) => a.id === panel)!.title}</h2>
            {panel === "cert" ? (
              <>
                <p className={s.body}>
                  {d.certificate.earned
                    ? `${d.name}完成證書上有走過的每一站和模擬結果。`
                    : "走完這條線的必經站和終點模擬，就會拿到完成證書。"}
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
                {/* TODO-VERIFY (D3): whether an online self-study record can be
                    used as a 學習歷程 多元表現 item is not confirmed
                    (docs/finline-redesign/VERIFIED.md item 9). Do not say it counts. */}
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
            {panel === "skills" ? (
              <ul className={s.skills}>
                {d.skills.map((k) => (
                  <li key={k}>
                    <Icon name="check" size={16} />
                    {k}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button variant="secondary" onClick={() => setPanel(null)}>
              關閉
            </Button>
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

const STATUS_WORD: Record<StationRow["status"], string> = { done: "已完成", current: "下一站", next: "還沒去" };

function StationItem({ st }: { st: StationRow }) {
  const inner = (
    <>
      <span className={`${s.dot} ${s[`dot_${st.status}`]}`} aria-hidden="true">
        {st.status === "done" ? <Icon name="check" size={14} /> : null}
      </span>
      <span className={s.rowMain}>
        <span className={s.rowName}>
          {st.name}
          {st.terminal ? <span className={s.terminal}>終點站</span> : null}
        </span>
        {st.learn ? <span className={s.rowLine}>你會學到：{st.learn}</span> : null}
        {st.does ? <span className={s.rowLine}>你要做的：{st.does}</span> : null}
        <span className="sr-only">{STATUS_WORD[st.status]}</span>
      </span>
      <span className={s.rowMin}>{st.meta ?? (st.minutes ? `約 ${st.minutes} 分鐘` : "")}</span>
    </>
  );
  return (
    <li>
      {st.href ? (
        <Link href={st.href} className={s.row} aria-current={st.status === "current" ? "step" : undefined}>
          {inner}
        </Link>
      ) : (
        <div className={s.row}>{inner}</div>
      )}
    </li>
  );
}
