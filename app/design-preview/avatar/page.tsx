import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  DEFAULT_AVATAR,
  FACES,
  HAIRS,
  MOODS,
  OUTFITS,
  SKIN_TONES,
  type Avatar as AvatarData,
  type HairColorId,
  type OutfitColorId,
} from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { AvatarPlayground } from "@/components/avatar/AvatarPlayground";

/**
 * Dev-only sheet of every avatar part (01-DESIGN-SYSTEM §6.2). 404 in
 * production. Not linked from anywhere.
 */

export const metadata = { title: "Avatar preview", robots: { index: false } };

// This route sits outside the (game) group, so the §2 tokens from
// app/(game)/game.css are not loaded here. Mirror the few this page and
// PartSwatch read, for this dev sheet only.
const TOKENS = {
  "--ink": "#16202A",
  "--ink-muted": "#4E5B66",
  "--ink-inverse": "#FFFFFF",
  "--track": "#DDE3E8",
  "--card-strong": "rgba(255,255,255,0.94)",
  "--focus": "#1F5FB8",
  "--radius-inner": "10px",
  "--station-floor": "#AEB8C0",
} as CSSProperties;

const HAIR_COLOR_SAMPLE: HairColorId[] = ["darkBrown", "caramel", "black", "plum"];
const OUTFIT_COLOR_SAMPLE: OutfitColorId[] = ["blue", "green", "berry", "mist"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </section>
  );
}

function Cell({ avatar, caption, ...rest }: { avatar: AvatarData; caption: string } & Omit<
  Parameters<typeof Avatar>[0],
  "avatar"
>) {
  return (
    <figure className="flex flex-col items-center gap-1 rounded-[var(--radius-inner)] bg-[var(--station-floor)] px-2 pt-2 pb-1">
      <Avatar avatar={avatar} {...rest} />
      <figcaption className="text-xs text-[var(--ink)]">{caption}</figcaption>
    </figure>
  );
}

export default function AvatarPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const base = DEFAULT_AVATAR;
  return (
    <main style={TOKENS} className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 text-[var(--ink)]">
      <h1 className="text-2xl font-bold">Avatar preview</h1>

      <Section title="210×306：三種心情與背面">
        {MOODS.map((mood) => (
          <Cell key={mood} avatar={base} mood={mood} caption={mood} title="小宇的角色" />
        ))}
        <Cell avatar={base} view="back" caption="back" />
      </Section>

      <Section title="髮型 × 髮色（正面，120×175）">
        {HAIRS.flatMap((h) =>
          HAIR_COLOR_SAMPLE.map((color) => (
            <Cell
              key={`${h.id}-${color}`}
              avatar={{ ...base, hair: h.id, hairColor: color }}
              size={120}
              caption={`${h.label} ${color}`}
            />
          )),
        )}
      </Section>

      <Section title="髮型（背面，120×175）">
        {HAIRS.map((h) => (
          <Cell key={h.id} avatar={{ ...base, hair: h.id }} view="back" size={120} caption={h.label} />
        ))}
      </Section>

      <Section title="臉 × 心情（120×175）">
        {FACES.flatMap((f) =>
          MOODS.map((mood) => (
            <Cell
              key={`${f.id}-${mood}`}
              avatar={{ ...base, face: f.id }}
              mood={mood}
              size={120}
              caption={`${f.label} ${mood}`}
            />
          )),
        )}
      </Section>

      <Section title="衣服 × 顏色（正面與背面，120×175）">
        {OUTFITS.flatMap((o) =>
          OUTFIT_COLOR_SAMPLE.map((color) => (
            <Cell
              key={`${o.id}-${color}`}
              avatar={{ ...base, outfit: o.id, outfitColor: color }}
              size={120}
              caption={`${o.label} ${color}`}
            />
          )),
        )}
        {OUTFITS.map((o) => (
          <Cell key={`${o.id}-back`} avatar={{ ...base, outfit: o.id }} view="back" size={120} caption={`${o.label} 背面`} />
        ))}
      </Section>

      <Section title="膚色（210×306）">
        {SKIN_TONES.map((s, i) => (
          <Cell
            key={s.id}
            avatar={{
              ...base,
              skin: s.id,
              hair: HAIRS[i % HAIRS.length].id,
              face: FACES[i % FACES.length].id,
            }}
            caption={s.label}
          />
        ))}
      </Section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Playground</h2>
        <AvatarPlayground />
      </section>
    </main>
  );
}
