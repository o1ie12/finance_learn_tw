import Link from "next/link";
import { LINES } from "@/lib/lines";

const NOT_AMERICA = [
  {
    tag: "台股",
    title: "賣股沒有資本利得稅",
    body: "個人股票價差不課所得稅，改在賣出時課 0.3% 證交稅，賺賠都收。",
    color: "#e3002c",
    ink: "#c20025",
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
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg,#e3002c 0 25%,#0070bd 25% 50%,#008659 50% 75%,#f8b61c 75% 100%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
            起點 Qidian · 免費
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
            每條線，
            <br />
            都從這裡出發。
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            起點是給台灣高中生的免費理財學習平台。它不是單一課程，而是一整組「路線」——每一條線都配一套文章課程與一個真實情境模擬，用台灣的規則與數字，帶你從第一份薪水、存錢、信用到投資，一站一站學會。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              免費開始
            </Link>
            <Link
              href="/lines"
              className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
            >
              看看所有路線
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-faint">
            免費、不需要帳號就能逛，開始也不用 email 或密碼。
          </p>
        </div>
      </section>

      {/* What this is */}
      <section
        aria-labelledby="what-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <h2 id="what-heading" className="text-2xl font-bold sm:text-3xl">
          像搭捷運一樣學理財
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          每一條線是一個主題，線上的每一「站」是一課文章加小測驗，走到終點站就是一場模擬——把學到的東西用在真實情境上。你可以照建議順序走，也可以挑最想學的先上。進度會一直記著，隨時回來接續。
        </p>
      </section>

      {/* The lines */}
      <section
        aria-labelledby="lines-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <div className="flex items-baseline justify-between">
          <h2 id="lines-heading" className="text-2xl font-bold sm:text-3xl">
            四條路線
          </h2>
          <Link href="/lines" className="text-sm font-medium text-line-2 underline">
            全部路線
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {LINES.map((line) => (
            <Link
              key={line.slug}
              href={`/line/${line.slug}`}
              className="group rounded-2xl border border-hairline bg-surface p-5 transition-transform hover:-translate-y-0.5"
              style={{ borderTop: `4px solid ${line.color}` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ background: line.color }}
                  aria-hidden="true"
                />
                <span className="font-bold">{line.name}</span>
                <span
                  className="font-display text-xs font-semibold uppercase tracking-wider"
                  style={{ color: line.colorInk }}
                >
                  {line.enName}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {line.short}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Taiwan-specific */}
      <section
        aria-labelledby="diff-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <h2 id="diff-heading" className="text-2xl font-bold sm:text-3xl">
          為什麼「這裡不是美國」很重要
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          市面上多數理財內容預設的是美國制度。起點特別把台灣真正的規則講對，因為這些差異會直接影響你的錢：
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

      {/* Trust */}
      <section
        aria-labelledby="trust-heading"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 id="trust-heading" className="text-xl font-bold">
            完全免費，也不會收集你的真實資料
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-soft">
            <li>· 免費、沒有付費升級、沒有廣告。</li>
            <li>· 不需要 email 或密碼，用一組代碼就能記住進度。</li>
            <li>· 不收集真實姓名、電話或任何金融帳號；所有數字都是教學情境。</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-ink px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">準備好上車了嗎？</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
            從旗艦的起薪線出發，或挑一條你最想學的線。免費開始，隨時回來接續。
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
