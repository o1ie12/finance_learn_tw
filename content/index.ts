/**
 * Every line's content, keyed by slug. Typed as a full Record over LineSlug
 * so adding a line to lib/lines.ts without its content file is a compile error.
 */

import { getLine } from "@/lib/lines";
import type { LineContent, LineSlug } from "@/lib/tasks/types";
import { withWrappedStations } from "@/lib/tasks/wrapped";
import { fillFigures } from "@/lib/tasks/figures";
import { WRAPPED_STATIONS } from "./stations";
import { content as zhiya } from "./lines/zhiya";
import { content as qixin } from "./lines/qixin";
import { content as cunqian } from "./lines/cunqian";
import { content as xinyong } from "./lines/xinyong";
import { content as touzi } from "./lines/touzi";
import { content as zhapian } from "./lines/zhapian";
import { content as xuedai } from "./lines/xuedai";
import { content as baoshui } from "./lines/baoshui";
import { content as zuwu } from "./lines/zuwu";
import { content as baoxian } from "./lines/baoxian";
import { content as chuangye } from "./lines/chuangye";
import { content as caiwujuece } from "./lines/caiwujuece";

const AUTHORED: Record<LineSlug, LineContent> = {
  zhiya,
  qixin,
  cunqian,
  xinyong,
  touzi,
  zhapian,
  xuedai,
  baoshui,
  zuwu,
  baoxian,
  chuangye,
  caiwujuece,
};

/**
 * Every station runs the station flow (05 A1): a station with no task set of
 * its own gets its quiz wrapped (lib/tasks/wrapped.ts).
 */
export const CONTENT_BY_SLUG = Object.fromEntries(
  Object.entries(AUTHORED).map(([slug, line]) => [
    slug,
    // Engine figures written into each lesson's text (lib/tasks/figures.ts).
    (() => {
      const l = withWrappedStations(line, getLine(slug)?.stationModules ?? [], WRAPPED_STATIONS);
      return { ...l, lessons: l.lessons.map(fillFigures) };
    })(),
  ]),
) as Record<LineSlug, LineContent>;
