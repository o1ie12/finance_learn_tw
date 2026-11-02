import Link from "next/link";
import s from "./notFound.module.css";

/** The 404 page (G9 item 18): Chinese, in the new look, with a way back. */
export default function NotFound() {
  return (
    <main className={s.page}>
      <span className={s.stripe} aria-hidden="true" />
      <div className={s.card}>
        <p className={s.code}>404 · 這一站不存在</p>
        <h1 className={s.title}>找不到這一頁</h1>
        <p className={s.text}>網址可能打錯了，或這一頁已經搬家。從下面回到你的路線。</p>
        <div className={s.actions}>
          <Link href="/today" className={s.primary}>回到今天</Link>
          <Link href="/lines" className={s.secondary}>看所有路線</Link>
        </div>
      </div>
    </main>
  );
}
