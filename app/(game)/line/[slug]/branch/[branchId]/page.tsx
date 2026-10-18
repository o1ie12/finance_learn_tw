import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getLine } from "@/lib/lines";
import { getBranch, branchesForLine, findBranchById } from "@/lib/branches";
import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Crumbs, LinkRows, MistakeBox } from "@/components/linePage/parts";

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

  return (
    <div className="lp-page lp-page--narrow">
      <Crumbs
        items={[
          { label: line.name, href: `/line/${line.slug}` },
          { label: `支線 · ${branch.title}` },
        ]}
      />

      <FloatCard as="article" strong index={0}>
        <StationSign line={line} station={`${line.name} · 支線`} code={line.enName.toUpperCase()} as="p" />
        <h1 className="lp-h1">{branch.title}</h1>
        <p className="lp-body-text">{branch.body}</p>
        <MistakeBox>{branch.mistake}</MistakeBox>
      </FloatCard>

      <FloatCard as="div" index={1}>
        <div className="lp-actions">
          <PrimaryButton href={`/line/${line.slug}`} line={line}>
            回到{line.name}
          </PrimaryButton>
        </div>
        {siblings.filter((b) => b.id !== branch.id).length > 0 ? (
          <LinkRows
            label="其他支線"
            items={siblings
              .filter((b) => b.id !== branch.id)
              .map((b) => ({
                key: b.id,
                href: `/line/${line.slug}/branch/${b.id}`,
                title: `另一條支線：${b.title}`,
              }))}
          />
        ) : null}
      </FloatCard>
    </div>
  );
}
