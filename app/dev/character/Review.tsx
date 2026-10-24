"use client";

/**
 * Dev-only character review (06 E10.7): the contact sheet (6 skins, 8 hairs,
 * 6 outfits, 6 faces, 6 moods), then the character standing in the platform
 * and the bank with all 8 outfit colors. 404 in production.
 * ?scene=platform|xinyong&color=N renders one full-screen scene for screenshots.
 */
import { Character } from "@/components/art/Character";
import { DEFAULT_LOOK, FACES, HAIR_STYLES, MOODS, OUTFITS, OUTFIT_COLORS, SKINS, type Look } from "@/components/art/look";
import { Scene, type SceneKind } from "@/components/art/scenes";
import { lineVars } from "@/lib/design/lineVars";
import { getLine } from "@/lib/lines";

function Row({ title, looks }: { title: string; looks: { key: string; look: Look; mood?: (typeof MOODS)[number] }[] }) {
  return (
    <section>
      <h2 style={{ font: "600 13px/18px var(--font-ui)", color: "var(--ink-3)", margin: "16px 0 4px" }}>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {looks.map((l) => (
          <figure key={l.key} style={{ margin: 0, textAlign: "center", font: "500 12px var(--font-ui)", color: "var(--ink-3)" }}>
            <Character look={l.look} mood={l.mood} width={96} />
            <figcaption>{l.key}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Sheet({ q }: { q: { scene?: string; color?: string } }) {
  const scene = (q.scene ?? null) as SceneKind | null;
  if (scene) {
    const color = OUTFIT_COLORS[Number(q.color ?? 0) % OUTFIT_COLORS.length];
    return (
      <div className="game-shell" style={{ ...lineVars(getLine("xinyong")!), position: "relative", height: "100dvh", overflow: "hidden" }}>
        <Scene kind={scene} className="" />
        <div style={{ position: "absolute", left: "50%", top: 217, transform: "translateX(-50%)" }}>
          <Character look={{ ...DEFAULT_LOOK, outfitColor: color }} width={182} />
        </div>
      </div>
    );
  }
  const L = DEFAULT_LOOK;
  return (
    <div className="game-shell" style={{ background: "var(--paper)", color: "var(--ink)", padding: 16, minHeight: "100dvh" }}>
      <Row title="膚色" looks={SKINS.map((c) => ({ key: c, look: { ...L, skin: c } }))} />
      <Row title="髮型" looks={HAIR_STYLES.map((h) => ({ key: h, look: { ...L, hairStyle: h } }))} />
      <Row title="衣服" looks={OUTFITS.map((o) => ({ key: o, look: { ...L, outfit: o } }))} />
      <Row title="臉" looks={FACES.map((f) => ({ key: f, look: { ...L, face: f } }))} />
      <Row title="心情" looks={MOODS.map((m) => ({ key: m, look: L, mood: m }))} />
      <Row title="衣服顏色" looks={OUTFIT_COLORS.map((c) => ({ key: c, look: { ...L, outfitColor: c } }))} />
      <section>
        <h2 style={{ font: "600 13px/18px var(--font-ui)", color: "var(--ink-3)", margin: "16px 0 4px" }}>背面</h2>
        <Character look={L} facing="back" width={96} />
      </section>
    </div>
  );
}

export default function Review({ q }: { q: { scene?: string; color?: string } }) {
  return <Sheet q={q} />;
}
