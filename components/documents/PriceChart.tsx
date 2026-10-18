import { formatNT } from "@/components/Money";
import type { PriceChartData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { cx, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * A simple line chart of monthly closes, drawn in SVG with tokens. It takes a
 * prepared series: when content leaves `series` empty and sets `source`, the
 * server fills it with preparePriceChart (components/documents/priceSeries.ts)
 * so the large price seed never reaches the client.
 *
 * The line is drawn in a stretched 100×100 SVG with non-scaling strokes; the
 * axis labels are HTML so they stay 12px at any width.
 *
 * No field ids: a chart is read, not searched.
 */

/** "2020-03" or "2020/03" → "2020/03". */
export function monthLabel(month: string): string {
  return month.replace("-", "/");
}

function priceLabel(v: number): string {
  return `NT$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** The footnote for a chart drawn from the price seed. */
export function priceSourceNote(ticker: "0050" | "0056"): string {
  return `資料：證交所 ${ticker} 每月最後一個交易日收盤價${ticker === "0050" ? "，已還原分割" : ""}。`;
}

function niceStep(range: number, count: number): number {
  const raw = range / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
  // Labels are whole NT$ (formatNT), so never step below 1.
  return Math.max(1, step);
}

export default function PriceChart({
  data,
  headingLevel,
  sourceNote,
}: { data: PriceChartData; sourceNote?: string } & DocumentProps) {
  const series = data.series;
  const n = series.length;

  if (n < 2) {
    return (
      <DocumentFrame title={data.title} fictional={false} headingLevel={headingLevel}>
        <p className={s.empty}>還沒有足夠的價格資料</p>
      </DocumentFrame>
    );
  }

  const closes = series.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const step = niceStep(Math.max(max - min, 1), 4);
  const lo = Math.floor(min / step) * step;
  const hi = Math.max(Math.ceil(max / step) * step, lo + step);
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(t);

  const x = (i: number) => (i / (n - 1)) * 100;
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * 100;
  const path = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(p.close).toFixed(2)}`).join(" ");

  // Sparse month labels: three at most, counted back from the last month
  // (the last label is right-aligned, so it never collides).
  const every = Math.max(1, Math.ceil(n / 3));
  const xTicks: number[] = [];
  for (let i = n - 1; i >= 0; i -= every) xTicks.unshift(i);

  const markIndex = data.markMonth ? series.findIndex((p) => p.month === data.markMonth) : -1;
  const mark = markIndex >= 0 ? series[markIndex] : null;
  const markChange =
    mark && markIndex > 0 ? (mark.close / series[markIndex - 1].close - 1) * 100 : null;

  const iMax = closes.indexOf(max);
  const iMin = closes.indexOf(min);
  const summary = [
    `${data.title}。`,
    `${monthLabel(series[0].month)} 到 ${monthLabel(series[n - 1].month)} 的每月收盤價，`,
    `從 ${priceLabel(series[0].close)} 到 ${priceLabel(series[n - 1].close)}。`,
    `最高 ${priceLabel(max)}（${monthLabel(series[iMax].month)}），`,
    `最低 ${priceLabel(min)}（${monthLabel(series[iMin].month)}）。`,
    mark
      ? `標記的月份是 ${monthLabel(mark.month)}，收盤 ${priceLabel(mark.close)}` +
        (markChange !== null
          ? `，比前一個月${markChange < 0 ? "跌" : "漲"} ${Math.abs(markChange).toFixed(1)}%。`
          : "。")
      : "",
  ].join("");

  const markX = markIndex >= 0 ? x(markIndex) : 0;

  return (
    <DocumentFrame
      title={data.title}
      subtitle="每月收盤價"
      fictional={false}
      footnote={sourceNote ?? (data.source ? priceSourceNote(data.source.ticker) : undefined)}
      headingLevel={headingLevel}
    >
      <div className={s.chartWrap}>
        <div role="img" aria-label={summary} className={s.chart}>
          <div className={s.yAxis} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className={s.yLabel} style={{ top: `${y(t)}%` }}>
                {formatNT(t)}
              </span>
            ))}
          </div>
          <div className={s.plot}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              {ticks.map((t) => (
                <line key={t} x1="0" x2="100" y1={y(t)} y2={y(t)} className={s.grid} vectorEffect="non-scaling-stroke" />
              ))}
              {mark && (
                <line
                  x1={markX}
                  x2={markX}
                  y1="0"
                  y2="100"
                  className={s.markLine}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <path d={path} className={s.line} vectorEffect="non-scaling-stroke" />
            </svg>
            {mark && (
              <>
                <span className={s.dot} style={{ left: `${markX}%`, top: `${y(mark.close)}%` }} aria-hidden="true" />
                <span
                  className={cx(s.markTag, markX > 75 && s.markTagEnd)}
                  style={{ left: `${markX}%` }}
                  aria-hidden="true"
                >
                  {monthLabel(mark.month)}
                  {markChange !== null && ` ${markChange < 0 ? "−" : "+"}${Math.abs(markChange).toFixed(1)}%`}
                </span>
              </>
            )}
          </div>
          <div className={s.xAxis} aria-hidden="true">
            {xTicks.map((i) => (
              <span
                key={i}
                className={cx(s.xLabel, i === 0 && s.xLabelFirst, i === n - 1 && s.xLabelLast)}
                style={{ left: `${x(i)}%` }}
              >
                {monthLabel(series[i].month)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{data.title}，每月收盤價</caption>
        <thead>
          <tr>
            <th scope="col">月份</th>
            <th scope="col">收盤價</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.month}>
              <th scope="row">
                {monthLabel(p.month)}
                {p.month === data.markMonth ? "（標記）" : ""}
              </th>
              <td>{priceLabel(p.close)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DocumentFrame>
  );
}
