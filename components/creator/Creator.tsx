"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Character } from "@/components/art/Character";
import { lookFromAvatar } from "@/components/art/look";
import { Scene } from "@/components/art/scenes";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/Options";
import { TopBar } from "@/components/ui/TopBar";
import { FACES, HAIRS, HAIR_COLORS, NAME_MAX, OUTFITS, OUTFIT_COLORS, SKIN_TONES, validateName, type Avatar } from "@/lib/avatar";
import s from "./creator.module.css";

type Tab = "face" | "hair" | "outfit" | "color";
const TABS: { id: Tab; label: string }[] = [
  { id: "face", label: "臉" },
  { id: "hair", label: "髮型" },
  { id: "outfit", label: "衣服" },
  { id: "color", label: "顏色" },
];

/**
 * The character creator (06 E8.8): one screen on the platform. Preview in
 * the middle, a segmented control (臉 / 髮型 / 衣服 / 顏色), a row of 64px
 * options per part with the part drawn on it, the name (2 to 8 characters,
 * plain text), and 出發. Every option is open; nothing is locked or sold.
 * Saves through /api/avatar (the same schema as before).
 */
export function Creator({ initial, next, onboarding }: { initial: Avatar; next: string; onboarding: boolean }) {
  const router = useRouter();
  const [avatar, setAvatar] = useState<Avatar>(initial);
  const [name, setName] = useState(onboarding ? "" : initial.name);
  const [tab, setTab] = useState<Tab>("face");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nameId = useId();
  const check = validateName(name);
  const set = <K extends keyof Avatar>(k: K, v: Avatar[K]) => setAvatar((a) => ({ ...a, [k]: v }));
  const look = lookFromAvatar({ ...avatar, name: check.ok ? check.value : avatar.name }, avatar.name);

  async function go() {
    if (busy) return;
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ avatar: { ...avatar, name: check.value } }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: unknown };
        setError(typeof data.message === "string" ? data.message : "沒有存好。再按一次出發。");
        setBusy(false);
        return;
      }
      router.push(next);
    } catch {
      setError("沒有存好。檢查網路後再按一次出發。");
      setBusy(false);
    }
  }

  // Thumbnails: the same character with one part changed, cropped to it.
  const thumb = (patch: Partial<Avatar>, crop: "head" | "body") => (
    <span className={`${s.thumb} ${crop === "head" ? s.cropHead : s.cropBody}`}>
      <Character look={lookFromAvatar({ ...avatar, ...patch }, "")} width={crop === "head" ? 92 : 112} />
    </span>
  );

  return (
    <div className={s.creator}>
      <Scene kind="platform" className={s.scene} />
      <div className={s.bar}>
        <TopBar title={onboarding ? "做出你的角色" : "修改角色"} back={onboarding ? undefined : { href: "/settings" }} />
      </div>
      <div className={s.preview}>
        <Character look={look} mood="happy" width={182} rim className={s.character} />
      </div>
      <div className={s.panel}>
        <Segmented label="角色部位" items={TABS} value={tab} onChange={setTab} />
        <div className={s.rows}>
          {tab === "face" ? (
            <Row label="表情" options={FACES.map((f) => ({ id: f.id, label: f.label, art: thumb({ face: f.id }, "head") }))} value={avatar.face} onChange={(v) => set("face", v as Avatar["face"])} />
          ) : null}
          {tab === "hair" ? (
            <Row label="髮型" options={HAIRS.map((h) => ({ id: h.id, label: h.label, art: thumb({ hair: h.id }, "head") }))} value={avatar.hair} onChange={(v) => set("hair", v as Avatar["hair"])} />
          ) : null}
          {tab === "outfit" ? (
            <Row label="衣服" options={OUTFITS.map((o) => ({ id: o.id, label: o.label, art: thumb({ outfit: o.id }, "body") }))} value={avatar.outfit} onChange={(v) => set("outfit", v as Avatar["outfit"])} />
          ) : null}
          {tab === "color" ? (
            <>
              <Row label="膚色" options={SKIN_TONES.map((c) => ({ id: c.id, label: c.label, art: <Swatch hex={c.hex} /> }))} value={avatar.skin} onChange={(v) => set("skin", v as Avatar["skin"])} />
              <Row label="髮色" options={HAIR_COLORS.map((c) => ({ id: c.id, label: c.label, art: <Swatch hex={c.hex} /> }))} value={avatar.hairColor} onChange={(v) => set("hairColor", v as Avatar["hairColor"])} />
              <Row label="衣服顏色" options={OUTFIT_COLORS.map((c) => ({ id: c.id, label: c.label, art: <Swatch hex={c.hex} /> }))} value={avatar.outfitColor} onChange={(v) => set("outfitColor", v as Avatar["outfitColor"])} />
            </>
          ) : null}
        </div>
        <div className={s.name}>
          <label htmlFor={nameId} className={s.nameLabel}>
            名字
          </label>
          <input
            id={nameId}
            className={s.nameInput}
            value={name}
            maxLength={NAME_MAX + 4}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="2 到 8 個字"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={`${nameId}-hint`}
          />
          <p id={`${nameId}-hint`} className={error ? s.nameError : s.nameHint} role={error ? "alert" : undefined}>
            {error ?? (name.trim() ? "2 到 8 個字。之後也可以改。" : "取一個 2 到 8 個字的名字，就可以出發。")}
          </p>
        </div>
        <Button onClick={go} disabled={!name.trim() || busy} busy={busy}>
          出發
        </Button>
      </div>
    </div>
  );
}

function Swatch({ hex }: { hex: string }) {
  return <span className={s.swatch} style={{ background: hex }} />;
}

function Row({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; art: React.ReactNode }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={s.row}>
      <span className={s.rowLabel} id={`row-${label}`}>
        {label}
      </span>
      <div className={s.options} role="radiogroup" aria-labelledby={`row-${label}`}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={o.label}
              className={s.option}
              onClick={() => onChange(o.id)}
            >
              {o.art}
              {on ? (
                <span className={s.check} aria-hidden="true">
                  <Icon name="check" size={14} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
