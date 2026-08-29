import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "合作夥伴",
  description: "起點正在與致力於財金教育的機構建立合作關係。",
};

export default function PartnershipsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
        合作夥伴
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        我們正在與致力於財金教育的機構建立合作關係
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        目前還沒有正式確定的合作夥伴。這裡會在合作關係確定後更新。
      </p>
    </div>
  );
}
