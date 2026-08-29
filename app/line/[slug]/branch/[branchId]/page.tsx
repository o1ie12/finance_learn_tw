import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import { getBranch, branchesForLine } from "@/lib/branches";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; branchId: string }>;
}): Promise<Metadata> {
  const { slug, branchId } = await params;
  const line = getLine(slug);
  const branch = line && getBranch(line.slug, branchId);
  if (!line || !branch) return { title: "找不到支線" };
  return { title: `${branch.title} · ${line.name}支線` };
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ slug: string; branchId: string }>;
}) {
  const { slug, branchId } = await params;
  const line = getLine(slug);
  if (!line) notFound();
  const branch = getBranch(line.slug, branchId);
  if (!branch) notFound();

  const siblings = branchesForLine(line.slug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href={`/line/${line.slug}`} className="hover:text-ink">
          {line.name}
        </Link>{" "}
        <span aria-hidden="true">/</span> 支線 · {branch.title}
      </nav>

      <p
        className="font-display text-xs font-bold uppercase tracking-widest"
        style={{ color: line.colorInk }}
      >
        {line.name} · 支線
      </p>
      <h1 className="mt-1.5 text-3xl font-black tracking-tight">{branch.title}</h1>

      <div className="mt-6 space-y-4">
        <p className="text-[16px] leading-[1.85] text-ink/90">{branch.body}</p>

        <div className="rounded-xl bg-surface p-5" style={{ borderLeft: "4px solid #e8542a" }}>
          <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: "#e8542a" }}>
            ⚠ 常見錯誤
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{branch.mistake}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/line/${line.slug}`}
          className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          回到{line.name}
        </Link>
        {siblings
          .filter((b) => b.id !== branch.id)
          .map((b) => (
            <Link
              key={b.id}
              href={`/line/${line.slug}/branch/${b.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-semibold hover:border-ink"
            >
              另一條支線：{b.title}
            </Link>
          ))}
      </div>
    </div>
  );
}
