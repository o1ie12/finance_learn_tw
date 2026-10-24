import Link from "next/link";
import HomeLink from "@/components/HomeLink";

const LINKS = [
  { href: "/lines", label: "所有路線" },
  { href: "/transfer", label: "轉乘站" },
  { href: "/about", label: "關於我們" },
  { href: "/partnerships", label: "合作夥伴" },
  { href: "/privacy", label: "隱私權政策" },
  { href: "/terms", label: "服務條款" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 pb-10 pt-7 text-[13px] text-ink-soft sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md">
          <p>
            <b className="font-black text-ink">錢途</b> Finline · 給台灣高中生的免費理財課
          </p>
          <p className="mt-1.5 text-xs text-ink-faint">
            所有情境與數字皆為教學用途，非個人化投資或財務建議。本網站不收集真實金融帳戶資訊。© {new Date().getFullYear()}
          </p>
        </div>
        <nav aria-label="頁尾導覽">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <HomeLink className="inline-flex min-h-11 items-center rounded hover:text-ink">我的路線圖</HomeLink>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
