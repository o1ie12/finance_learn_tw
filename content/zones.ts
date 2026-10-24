/**
 * The four zones the route map groups lines into (2026-10-24 redesign): the
 * lines a student is riding get full rows, every other line is a badge in
 * its zone. Every line appears in exactly one zone (tests/routeBoard.test.ts).
 */
import type { LineSlug } from "@/lib/lines";

export const ZONES: { name: string; en: string; lines: LineSlug[] }[] = [
  { name: "日常的錢", en: "EVERYDAY", lines: ["cunqian", "qixin", "xinyong"] },
  { name: "保護自己", en: "PROTECT", lines: ["zhapian", "baoxian"] },
  { name: "讓錢長大", en: "GROW", lines: ["touzi", "zhiya", "chuangye"] },
  { name: "人生大事", en: "MILESTONES", lines: ["xuedai", "zuwu", "baoshui", "caiwujuece"] },
];
