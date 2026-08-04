import Link from "next/link";
import { MODULES, SIMULATION_STATION } from "@/lib/modules";
import RouteMap, { type RouteStation } from "@/components/RouteMap";
import { GROSS_SALARY } from "@/lib/simulation";
import { formatNT } from "@/components/Money";

const PIECES = [
  {
    n: "01",
    title: "五個課程模組",
    body: "從消費心理到台股，用文章帶你一步步理解，每課附小測驗。",
    color: "#c20025",
  },
  {
    n: "02",
    title: "第一份薪水模擬",
    body: "拿一份真實的台北起薪，練習租屋、交通與儲蓄的取捨。",
    color: "#005a99",
  },
  {
    n: "03",
    title: "AI 理財教練",
    body: "根據你在模擬中的選擇，用你的數字給出具體回饋。",
    color: "#00734a",
  },
  {
    n: "04",
    title: "學習進度儀表板",
    body: "一條會亮起來的路線，記錄你完成的每一站與模擬結果。",
    color: "#7f5a1e",
  },
];

const NOT_AMERICA = [
  {
    tag: "台股",
    title: "賣股沒有資本利得稅",
    body: "個人股票價差不課所得稅，改在賣出時課 0.3% 證交稅，賺賠都收。",
    color: "#c48c31",
    ink: "#7f5a1e",
  },
  {
    tag: "退休金",
    title: "勞退自動幫你存 6%",
    body: "一上工，雇主依法每月提繳月薪 6% 到你的退休金帳戶，不用申請。",
    color: "#008659",
    ink: "#00734a",
  },
  {
    tag: "醫療",
    title: "全民健保自動納保",
    body: "保費由個人、雇主、政府三方分攤，不綁定單一私人公司方案。",
    color: "#f8b61c",
    ink: "#8a5a00",
  },
  {
    tag: "支付",
    title: "行動支付是日常",
    body: "街口、LINE Pay、台灣Pay——這裡的預算從手機裡的錢包開始算。",
    color: "#0070bd",
    ink: "#005a99",
  },
];

export default function Home() {
  const stations: RouteStation[] = [
    ...MODULES.map((m) => ({
      key: `m${m.number}`,
      label: m.station,
      title: m.title,
      color: m.color,
      colorInk: m.colorInk,
      href: `/course/${m.number}`,
      status: "todo" as const,
    })),
    {
      key: "sim",
      label: SIMULATION_STATION.station,
      title: SIMULATION_STATION.title,
      color: "#151a21",
      href: "/simulation",
      status: "todo" as const,
      terminal: true,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg,#e3002c 0 20%,#0070bd 20% 40%,#008659 40% 60%,#f8b61c 60% 80%,#c48c31 80% 100%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
            First Salary Line · 免費
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
            搭上理財這條線，
            <br />
            抵達你的第一份薪水。
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            專為台灣高中生設計的免費理財課。五個模組把消費心理、預算、複利、銀行信用與台股講清楚，最後用一場「第一份薪水模擬」，讓你在畢業前先練習真正的財務選擇。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              免費開始上課
            </Link>
            <Link
              href="/course"
              className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
            >
              先看看五個模組
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-faint">
            起薪設定為{" "}
            <span className="money font-medium text-ink">
              {formatNT(GROSS_SALARY)}
            </span>{" "}
            / 月——台灣大學畢業生的平均起薪。不需要真實金融帳號。
          </p>
        </div>
      </section>

      {/* Four pieces */}
      <section
        aria-labelledby="pieces-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <h2 id="pieces-heading" className="text-2xl font-bold sm:text-3xl">
          四個部分，一起運作
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PIECES.map((p) => (
            <div
              key={p.n}
              className="rounded-2xl border border-hairline bg-surface p-6"
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-display text-2xl font-bold tabular-nums"
                  style={{ color: p.color }}
                >
                  {p.n}
                </span>
                <h3 className="text-lg font-bold">{p.title}</h3>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The line */}
      <section
        aria-labelledby="line-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
          <div>
            <h2 id="line-heading" className="text-2xl font-bold sm:text-3xl">
              這條路線，五站加一個終點
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              每一課都是路線上的一站，用台灣的真實數字與制度來教——不是照抄美國。讀完五站，就抵達終點的「起薪站」，把學到的東西全部用上。
            </p>
            <Link
              href="/course"
              className="mt-6 inline-flex items-center gap-1 rounded-md font-semibold text-line-2 hover:underline"
            >
              進入課程 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <RouteMap stations={stations} />
          </div>
        </div>
      </section>

      {/* Not America */}
      <section
        aria-labelledby="diff-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <h2 id="diff-heading" className="text-2xl font-bold sm:text-3xl">
          為什麼「這裡不是美國」很重要
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          市面上多數理財內容預設的是美國制度。這套課程特別把台灣真正的規則講對，這些差異會直接影響你的錢：
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {NOT_AMERICA.map((c) => (
            <div
              key={c.tag}
              className="rounded-2xl border border-hairline bg-surface p-6"
              style={{ borderTop: `4px solid ${c.color}` }}
            >
              <p
                className="font-display text-xs font-bold uppercase tracking-wider"
                style={{ color: c.ink }}
              >
                {c.tag}
              </p>
              <h3 className="mt-1 text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-ink px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">準備好上車了嗎？</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
            建立一組專屬代碼就能開始，免密碼、免 email，隨時回來接著學。
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            免費開始
          </Link>
        </div>
      </section>
    </>
  );
}
