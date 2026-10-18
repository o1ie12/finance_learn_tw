/**
 * Every line's content, keyed by slug. Typed as a full Record over LineSlug
 * so adding a line to lib/lines.ts without its content file is a compile error.
 */

import type { LineContent, LineSlug } from "@/lib/tasks/types";
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

export const CONTENT_BY_SLUG: Record<LineSlug, LineContent> = {
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
