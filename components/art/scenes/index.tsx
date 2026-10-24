/**
 * Scenes (06 E9.3): one file per world, one table from line slug to scene.
 * Adding a line is one line here. Unknown slug: the platform.
 */
import type { LineSlug } from "@/lib/lines";
import Baoshui from "./Baoshui";
import Baoxian from "./Baoxian";
import Caiwujuece from "./Caiwujuece";
import Chuangye from "./Chuangye";
import Cunqian from "./Cunqian";
import Platform from "./Platform";
import Qixin from "./Qixin";
import Touzi from "./Touzi";
import Xinyong from "./Xinyong";
import Xuedai from "./Xuedai";
import Zhapian from "./Zhapian";
import Zhiya from "./Zhiya";
import Zuwu from "./Zuwu";

export type SceneKind = "platform" | LineSlug;

const SCENES: Record<SceneKind, (p: { className?: string }) => React.JSX.Element> = {
  platform: Platform,
  xinyong: Xinyong,
  qixin: Qixin,
  cunqian: Cunqian,
  touzi: Touzi,
  baoxian: Baoxian,
  zhapian: Zhapian,
  zhiya: Zhiya,
  xuedai: Xuedai,
  baoshui: Baoshui,
  zuwu: Zuwu,
  chuangye: Chuangye,
  caiwujuece: Caiwujuece,
};

/** Night worlds (E9.4): drawn dark already, so dark mode only dims them a little (.scene--night). */
const NIGHT: ReadonlySet<SceneKind> = new Set(["qixin", "touzi", "zhapian", "caiwujuece"]);

/**
 * The character's light rim (E9.1.4: the silhouette stays ≥ 3:1 against the
 * scene for every outfit color): on the platform's dark tunnel and in the
 * night worlds, where the dark outline alone would sink.
 */
export function sceneNeedsRim(kind: SceneKind): boolean {
  return kind === "platform" || NIGHT.has(kind);
}

export function Scene({ kind, className }: { kind: SceneKind; className?: string }) {
  const S = SCENES[kind] ?? Platform;
  return <S className={className} />;
}
