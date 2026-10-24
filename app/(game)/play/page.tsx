import { redirect } from "next/navigation";

/**
 * The life-game turn moved to the Part E shell (06 E8.6): /play goes to
 * /turn with its ride query unchanged (parseRide reads the same keys).
 * Class mode keeps its own turn screen at /class/life/play.
 */
export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) {
    for (const one of Array.isArray(v) ? v : v === undefined ? [] : [v]) q.append(k, one);
  }
  const rest = q.toString();
  redirect(rest ? `/turn?${rest}` : "/turn");
}
