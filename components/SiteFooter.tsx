import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-base font-bold">起薪線</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              給台灣高中生的免費理財課與模擬體驗。所有情境與數字皆為教學用途，非個人化投資或財務建議。
            </p>
          </div>
          <nav aria-label="頁尾導覽">
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              <li>
                <Link href="/course" className="rounded hover:text-ink">
                  五個課程模組
                </Link>
              </li>
              <li>
                <Link href="/simulation" className="rounded hover:text-ink">
                  第一份薪水模擬
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="rounded hover:text-ink">
                  我的學習進度
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs text-ink-faint">
          © {new Date().getFullYear()} 起薪線 · 教育專案 · 本網站不收集真實金融帳戶資訊
        </p>
      </div>
    </footer>
  );
}
