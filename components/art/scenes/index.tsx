/**
 * Scenes (06 E9.3): one file per world, one table from line slug to scene.
 * Adding a line is one line here. Unknown slug: the platform.
 */
import type { LineSlug } from "@/lib/lines";
import Platform from "./Platform";
import Xinyong from "./Xinyong";

export type SceneKind = "platform" | LineSlug;

const SCENES: Partial<Record<SceneKind, (p: { className?: string }) => React.JSX.Element>> = {
  platform: Platform,
  xinyong: Xinyong,
};

export function Scene({ kind, className }: { kind: SceneKind; className?: string }) {
  const S = SCENES[kind] ?? Platform;
  return <S className={className} />;
}
