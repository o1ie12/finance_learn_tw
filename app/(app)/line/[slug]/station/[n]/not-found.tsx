"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "@/app/notFound.module.css";

/**
 * 11 COPY-4: a station number this line does not have. Station URLs use the
 * global station number (/line/zhiya/station/39), so /station/1 on most
 * lines lands here, with a way back to the line.
 */
export default function StationNotFound() {
  const slug = usePathname().split("/")[2] ?? "";
  return (
    <main className={s.page}>
      <div className={s.card}>
        <p className={s.code}>404</p>
        <h1 className={s.title}>這條線沒有這一站</h1>
        <p className={s.text}>站的網址用的是全站的站號。回到路線頁，從那裡選一站。</p>
        <div className={s.actions}>
          <Link href={`/line/${slug}`} className={s.primary}>
            回到路線
          </Link>
          <Link href="/lines" className={s.secondary}>
            看所有路線
          </Link>
        </div>
      </div>
    </main>
  );
}
