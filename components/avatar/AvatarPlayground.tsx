"use client";

/**
 * Dev-only playground for app/design-preview/avatar: pick every part with
 * PartSwatch and see the result in all moods and both views. Also a
 * reference for how the character creator wires PartSwatch to state.
 */
import { useState } from "react";
import {
  AVATAR_PALETTES,
  DEFAULT_AVATAR,
  MOODS,
  PART_KINDS,
  validateName,
  type Avatar as AvatarData,
  type PartKind,
} from "@/lib/avatar";
import { Avatar } from "./Avatar";
import { PartSwatch } from "./PartSwatch";

const KIND_LABEL: Record<PartKind, string> = {
  skin: "膚色",
  face: "臉",
  hair: "髮型",
  hairColor: "髮色",
  outfit: "衣服",
  outfitColor: "衣服顏色",
};

export function AvatarPlayground() {
  const [avatar, setAvatar] = useState<AvatarData>(DEFAULT_AVATAR);
  const [nameDraft, setNameDraft] = useState<string>(DEFAULT_AVATAR.name);
  const check = validateName(nameDraft);

  function pick<K extends PartKind>(kind: K, id: AvatarData[K]) {
    setAvatar((prev) => ({ ...prev, [kind]: id }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        {MOODS.map((mood) => (
          <figure key={mood} className="flex flex-col items-center gap-1">
            <Avatar avatar={avatar} mood={mood} title={`${avatar.name}的角色`} />
            <figcaption className="text-xs text-[var(--ink-muted)]">{mood}</figcaption>
          </figure>
        ))}
        <figure className="flex flex-col items-center gap-1">
          <Avatar avatar={avatar} view="back" />
          <figcaption className="text-xs text-[var(--ink-muted)]">back</figcaption>
        </figure>
      </div>

      <label className="flex max-w-xs flex-col gap-1 text-sm">
        <span className="font-bold">名字</span>
        <input
          value={nameDraft}
          onChange={(e) => {
            setNameDraft(e.target.value);
            const next = validateName(e.target.value);
            if (next.ok) setAvatar((prev) => ({ ...prev, name: next.value }));
          }}
          className="min-h-11 rounded-[var(--radius-inner)] border border-[var(--track)] bg-[var(--card-strong)] px-3"
          aria-invalid={!check.ok}
          aria-describedby="avatar-name-hint"
        />
        <span id="avatar-name-hint" className="text-xs text-[var(--ink-muted)]">
          {check.ok ? "2 到 8 個字。" : check.reason}
        </span>
      </label>

      {PART_KINDS.map((kind) => (
        <fieldset key={kind} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">{KIND_LABEL[kind]}</legend>
          <div className="flex flex-wrap gap-2">
            {AVATAR_PALETTES[kind].map((option) => (
              <PartSwatch
                key={option.id}
                kind={kind}
                optionId={option.id as AvatarData[typeof kind]}
                avatar={avatar}
                selected={avatar[kind] === option.id}
                onSelect={(id) => pick(kind, id)}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default AvatarPlayground;
