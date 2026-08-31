import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "關於我們",
  description: "起點是給台灣高中生的第一堂真正用得到的理財課，完全免費。",
};

const TEAM = [
  { name: "Oliver（邱羿廷）", role: "共同創辦人 · 平台開發與技術" },
  { name: "Ryan（林宥宏）", role: "共同創辦人 · 內容規劃與對外合作" },
  { name: "Dr. Libbey", role: "顧問" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
        關於我們
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        起點，是給台灣高中生的第一堂真正用得到的理財課
      </h1>

      <div className="mt-8 space-y-5 text-[16px] leading-[1.85] text-ink/90">
        <p>
          我們是兩個還在念高中的學生。開始做這個平台，是因為發現學校教育幾乎不談「錢」這件事——沒人教我們怎麼看懂薪資單、怎麼避開卡債陷阱、怎麼分辨真投資跟詐騙。等到真的出社會才學，往往已經付出代價。
        </p>
        <p>
          起點用台灣自己的金融制度、真實的數據、貼近生活的情境，把理財變成可以互動、可以練習、甚至會出錯的體驗，而不是背誦名詞。我們相信理財教育不該是有錢家庭的特權，所以起點完全免費。
        </p>
      </div>

      <section aria-labelledby="team-heading" className="mt-12">
        <h2 id="team-heading" className="text-xl font-bold">
          團隊
        </h2>
        <ul className="mt-4 space-y-3">
          {TEAM.map((t) => (
            <li
              key={t.name}
              className="rounded-2xl border border-hairline bg-surface px-5 py-4"
            >
              <p className="font-bold">{t.name}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{t.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-heading" className="mt-12">
        <h2 id="contact-heading" className="text-xl font-bold">
          聯絡我們
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          有想法、合作提案，或發現內容有錯，歡迎寫信給我們。
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          {CONTACT_EMAIL}
        </a>
      </section>
    </div>
  );
}
