import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Class Mode",
  description: "老師開一場即時測驗，學生用房間代碼加入，即時排行榜比拚正確率與速度。",
};

export default function ClassLandingPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-ink-faint">
        Class Mode
      </p>
      <h1 className="mt-1.5 text-3xl font-black tracking-tight">課堂模式</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        老師開一場即時測驗，學生用房間代碼加入，答完後看誰又快又準。題目直接使用各路線的前後測題庫，不用另外準備。
      </p>

      <div className="mt-8 space-y-3">
        <Link
          href="/class/host"
          className="block rounded-2xl bg-ink px-6 py-5 text-white transition-transform hover:-translate-y-0.5"
        >
          <p className="text-lg font-bold">我是老師</p>
          <p className="mt-1 text-sm text-white/70">開一個房間，選一條路線的題庫，取得房間代碼。</p>
        </Link>
        <Link
          href="/class/play"
          className="block rounded-2xl border border-hairline bg-surface px-6 py-5 transition-colors hover:border-ink"
        >
          <p className="text-lg font-bold">我是學生</p>
          <p className="mt-1 text-sm text-ink-soft">輸入老師給的房間代碼加入。</p>
        </Link>
      </div>
    </div>
  );
}
