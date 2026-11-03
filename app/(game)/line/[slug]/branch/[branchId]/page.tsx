import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getLine } from "@/lib/lines";
import { getBranch, branchesForLine, findBranchById } from "@/lib/branches";
import Link from "next/link";
import { MistakeBox } from "@/components/linePage/parts";
import { PageHeader, Panel, pageStyles as ps } from "@/components/page/Page";
import { Icon } from "@/components/ui/icons";

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
  if (!branch) {
    // A branch that moved lines keeps working at its old address.
    const moved = findBranchById(branchId);
    if (moved) permanentRedirect(`/line/${moved.lineSlug}/branch/${moved.id}`);
    notFound();
  }

  const siblings = branchesForLine(line.slug);

  const others = siblings.filter((b) => b.id !== branch.id);
  // 2026-11-03: the shared page header and panels.
  return (
    <>
      <PageHeader
        kicker={`${line.name} · 支線`}
        title={branch.title}
        intro="支線是選讀的延伸，不影響這條線的進度。"
        actions={
          <Link href={`/line/${line.slug}`} className={ps.secondary}>
            回到{line.name}
          </Link>
        }
      />
      <div className={ps.stack}>
        <Panel>
          <p className="lp-body-text">{branch.body}</p>
          <MistakeBox>{branch.mistake}</MistakeBox>
        </Panel>
        {others.length > 0 ? (
          <Panel label="其他支線">
            <nav className={ps.links} aria-label="其他支線">
              {others.map((b) => (
                <Link key={b.id} href={`/line/${line.slug}/branch/${b.id}`} className={ps.linkRow}>
                  <span>{b.title}</span>
                  <Icon name="chevron" size={20} />
                </Link>
              ))}
            </nav>
          </Panel>
        ) : null}
      </div>
    </>
  );
}
