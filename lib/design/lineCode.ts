import { LINES, type LineMeta } from "@/lib/lines";

/**
 * The station sign's code (06 E7.7): line letter(s) and a two-digit station
 * number, e.g. 「CREDIT LINE · CR01」. A line's letter is the first letter of
 * its English name; lines that share a first letter get a second letter
 * (the first later letter of the name that is unique within that group).
 */
const LETTERS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const groups = new Map<string, LineMeta[]>();
  for (const l of LINES) {
    const k = l.enName[0].toUpperCase();
    groups.set(k, [...(groups.get(k) ?? []), l]);
  }
  for (const [first, group] of groups) {
    if (group.length === 1) {
      out[group[0].slug] = first;
      continue;
    }
    const used = new Set<string>();
    for (const l of group) {
      const rest = l.enName.slice(1).toUpperCase().replace(/[^A-Z]/g, "");
      const second = [...rest].find((c) => !used.has(c)) ?? "X";
      used.add(second);
      out[l.slug] = first + second;
    }
  }
  return out;
})();

/** The code alone, e.g. 「CR01」 (the train's destination sign). */
export function stationLetterCode(line: Pick<LineMeta, "slug" | "enName">, stationNumber: number): string {
  return `${LETTERS[line.slug] ?? line.enName[0].toUpperCase()}${String(stationNumber).padStart(2, "0")}`;
}

export function signCode(line: Pick<LineMeta, "slug" | "enName">, stationNumber: number): string {
  return `${line.enName.toUpperCase()} · ${LETTERS[line.slug] ?? line.enName[0].toUpperCase()}${String(stationNumber).padStart(2, "0")}`;
}
