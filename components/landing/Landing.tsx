import Link from "next/link";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";
import { LINES, getLine, lineMinutes, type LineMeta, type LineSlug } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { lessonForStation } from "@/lib/tasks/registry";
import { Arrow, SectionTag } from "./bits";
import { FareGate } from "./FareGate";
import s from "./landing.module.css";

const FEATURED: LineSlug[] = ["xinyong", "cunqian", "qixin", "zhapian"];
const BOARD: LineSlug[] = ["xinyong", "cunqian", "qixin", "zhapian", "touzi"];

const STOPS = [
  { title: "想一想", body: "一個沒有標準答案的問題，先說出你的直覺。" },
  { title: "先懂", body: "一兩張卡，只講做任務需要的那一件事。" },
  { title: "任務", body: "讀真實格式的帳單、契約、薪資單，做決定。" },
  { title: "對答案", body: "你的答案和建議答案並排，看差在哪裡。" },
  { title: "人生", body: "結果帶進人生模擬，這個月的錢跟著變。" },
];

// Verified in docs/redesign/sources.md; the same figures the lines teach.
const TAIWAN = [
  { color: "var(--metro-red)", title: "賣股不課資本利得稅", body: "個人買賣股票和 ETF 的價差不課所得稅，改在賣出時課證交稅，賺賠都收。", figure: "0.1%", unit: "ETF 證交稅（股票 0.3%）" },
  { color: "var(--metro-green)", title: "勞退自動幫你存", body: "一上工，雇主依法每月提繳月薪的 6% 到你的勞退個人專戶，不用申請。", figure: "6%", unit: "雇主每月提繳" },
  { color: "var(--metro-yellow)", title: "全民健保自動納保", body: "保費由個人、雇主和政府分攤，不綁定任何一家私人保險公司。", figure: "3 方", unit: "分攤保費" },
  { color: "var(--metro-blue)", title: "信用卡利率有上限", body: "信用卡循環利率最高 15%；只繳最低應繳時，沒繳的部分就用這個利率算利息。", figure: "15%", unit: "循環利率上限" },
];

const lineCode = (line: LineMeta) => stationLetterCode(line, 1).replace(/\d+$/, "");
const stationName = (n: number) => getModule(n)?.station ?? "";

/**
 * The public landing (2026-10-24 redesign): the departure board hero, the
 * first lines, a station's five stops, Taiwan's rules, and the fare gate
 * that leads to sign-up. Every line, station and minute comes from the
 * lines themselves.
 */
export function Landing() {
  const stations = LINES.reduce((a, l) => a + l.stationModules.length + 1, 0);
  const lines = (slugs: LineSlug[]) => slugs.map((slug) => getLine(slug)!);
  const credit = getLine("xinyong")!;
  const creditFirst = credit.stationModules[0];
  const creditLesson = lessonForStation("xinyong", creditFirst);

  return (
    <div className={s.page}>
      {/* FL01 起點站 */}
      <section className={s.hero}>
        <div className={s.heroText}>
          <SectionTag code="FL01" color="var(--ink)">
            <span className={s.heroStation}>
              起點站 <small>START</small>
            </span>
          </SectionTag>
          <h1 className={s.h1}>
            理財，
            <br />
            一站一站學。
          </h1>
          <p className={s.lede}>
            給台灣高中生的免費理財課。{LINES.length} 條路線、{stations} 站：每一站讀一份真的帳單、契約或薪資單，做一個決定；每條線的終點是一場模擬。
          </p>
          <div className={s.heroCta}>
            <Link href="/line/xinyong" className={s.primary}>
              從信用線上車
              <Arrow />
            </Link>
            <span className={s.heroNote}>
              免費 · 不用 email
              <br />
              一組代碼記住進度
            </span>
          </div>
        </div>

        <div className={s.stage}>
          <div className={s.stageGlass} aria-hidden="true" />
          <div className={s.sign} style={lineVars(credit)} aria-hidden="true">
            <span className={s.signStripe} />
            <div>
              <div className={s.signKicker}>下一站 NEXT · {stationLetterCode(credit, 1)}</div>
              <div className={s.signName}>{stationName(creditFirst)}</div>
            </div>
          </div>
          <div className={s.board} role="table" aria-label="即將進站">
            <div className={s.boardHead}>
              <span>
                即將進站 <small>DEPARTURES</small>
              </span>
              <span className={s.blink}>● 準備發車</span>
            </div>
            <div className={`${s.boardRow} ${s.boardCols}`} role="row">
              <span role="columnheader">路線</span>
              <span role="columnheader">下一站</span>
              <span role="columnheader">開往</span>
              <span role="columnheader">分鐘</span>
            </div>
            {lines(BOARD).map((line) => {
              const [first, second] = line.stationModules;
              const minutes = lessonForStation(line.slug, first)?.minutes;
              return (
                <div key={line.slug} className={s.boardRow} role="row" style={lineVars(line)}>
                  <span role="cell" className={s.boardLine}>
                    <span className={s.code}>{lineCode(line)}</span>
                    {line.name}
                  </span>
                  <span role="cell" className={s.boardNext}>
                    {stationName(first)}
                  </span>
                  <span role="cell" className={s.boardTo}>
                    {second ? stationName(second) : "終點模擬"}
                  </span>
                  <span role="cell" className={s.boardMin}>
                    {minutes ? String(minutes).padStart(2, "0") : "--"}
                  </span>
                </div>
              );
            })}
          </div>
          {creditLesson ? (
            <div className={s.ticket} aria-hidden="true">
              <div className={s.ticketHead}>
                <span>任務單 · {stationLetterCode(credit, 1)}</span>
                <span>{creditLesson.minutes} 分鐘</span>
              </div>
              <div className={s.ticketRule} />
              <div className={s.ticketBody}>{creditLesson.task.brief.do}</div>
            </div>
          ) : null}
        </div>
      </section>

      {/* FL02 the first lines */}
      <section className={s.section} aria-labelledby="lines-h">
        <div className={s.sectionHead}>
          <SectionTag code="FL02" color="var(--metro-blue)">
            <h2 id="lines-h" className={s.h2}>
              從這幾條線開始
            </h2>
          </SectionTag>
          <Link href="/lines" className={s.more}>
            全部 {LINES.length} 條路線 →
          </Link>
        </div>
        <div className={s.lines}>
          {lines(FEATURED).map((line) => {
            const total = line.stationModules.length + 1;
            return (
              <Link key={line.slug} href={`/line/${line.slug}`} className={s.lineCard} style={lineVars(line)}>
                <span className={s.lineName}>
                  <span className={s.code}>{lineCode(line)}</span>
                  {line.name}
                </span>
                <span className={s.linePromise}>{line.short}</span>
                <span className={s.track} aria-hidden="true">
                  <span className={s.trackBar} />
                  <span className={s.trackDots}>
                    {Array.from({ length: total }, (_, i) => (
                      <span key={i} data-terminal={i === total - 1 || undefined} />
                    ))}
                  </span>
                </span>
                <span className={s.trackEnds}>
                  <span>{stationName(line.stationModules[0])}</span>
                  <span>終點模擬</span>
                </span>
                <span className={s.lineMeta}>
                  {total} 站 · 約 {lineMinutes(line)} 分鐘
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FL03 a station's five stops */}
      <section className={s.section} aria-labelledby="how-h">
        <SectionTag code="FL03" color="var(--metro-red)">
          <h2 id="how-h" className={s.h2}>
            一站，十分鐘，五個停靠
          </h2>
        </SectionTag>
        <div className={`${s.glass} ${s.stopsCard}`}>
          <ol className={s.stops}>
            {STOPS.map((stop, i) => (
              <li key={stop.title}>
                <span className={s.stopDot} aria-hidden="true" />
                <span className={s.stopNo}>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.stopTitle}>{stop.title}</span>
                <span className={s.stopBody}>{stop.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FL04 Taiwan's rules */}
      <section className={s.section} aria-labelledby="tw-h">
        <SectionTag code="FL04" color="var(--metro-green)">
          <h2 id="tw-h" className={s.h2}>
            這裡不是美國
          </h2>
        </SectionTag>
        <p className={s.sub}>網路上多數理財內容講的是美國制度。錢途用台灣的規則和數字：</p>
        <dl className={s.rules}>
          {TAIWAN.map((r) => (
            <div key={r.title} className={s.rule}>
              <span className={s.ruleBar} style={{ background: r.color }} aria-hidden="true" />
              <dt>{r.title}</dt>
              <dd className={s.ruleBody}>{r.body}</dd>
              <dd className={s.ruleFigure}>
                {r.figure}
                <small>{r.unit}</small>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FL05 the fare gate */}
      <section className={`${s.section} ${s.last}`} aria-labelledby="go-h">
        <FareGate />
      </section>
    </div>
  );
}
