"use client";

/**
 * The character creator (01-DESIGN-SYSTEM §6.2): a big preview standing on
 * the platform, and one card with four tabs of 64×64 part swatches, a name
 * field and 「完成」.
 *
 * Every option is open from the first screen (RULE 6): there is no locked,
 * priced or disabled swatch anywhere in this file.
 */
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/avatar/Avatar";
import { PartSwatch } from "@/components/avatar/PartSwatch";
import { FloatCard } from "@/components/game/FloatCard";
import { NamePlate } from "@/components/game/NamePlate";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  AVATAR_PALETTES,
  NAME_MAX,
  NAME_MIN,
  validateName,
  type Avatar as AvatarData,
  type PartKind,
} from "@/lib/avatar";
import s from "./onboarding.module.css";

interface TabDef {
  id: "face" | "hair" | "outfit" | "color";
  label: string;
  groups: { kind: PartKind; label: string }[];
}

const TABS: TabDef[] = [
  { id: "face", label: "臉", groups: [{ kind: "face", label: "臉" }] },
  { id: "hair", label: "髮型", groups: [{ kind: "hair", label: "髮型" }] },
  { id: "outfit", label: "衣服", groups: [{ kind: "outfit", label: "衣服" }] },
  {
    id: "color",
    label: "顏色",
    groups: [
      { kind: "skin", label: "膚色" },
      { kind: "hairColor", label: "髮色" },
      { kind: "outfitColor", label: "衣服顏色" },
    ],
  },
];

export interface CharacterCreatorProps {
  /** The student's saved character, or the default parts named after them. */
  initial: AvatarData;
  /** Where 「完成」 and 「先跳過」 go next. */
  next: string;
  /** First time through (shows 「先跳過」); otherwise editing (shows 「取消」). */
  onboarding: boolean;
  /** The student's home, for 「取消」 when editing. */
  homeHref: string;
}

export function CharacterCreator({ initial, next, onboarding, homeHref }: CharacterCreatorProps) {
  const router = useRouter();
  const baseId = useId();
  const [avatar, setAvatar] = useState<AvatarData>(initial);
  const [nameDraft, setNameDraft] = useState(initial.name);
  const [showNameError, setShowNameError] = useState(false);
  const [tab, setTab] = useState<TabDef["id"]>("face");
  const [busy, setBusy] = useState<"save" | "skip" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  const nameCheck = validateName(nameDraft);
  const shownName = nameCheck.ok ? nameCheck.value : avatar.name;
  const nameHintId = `${baseId}-name-hint`;
  const nameErrorId = `${baseId}-name-error`;
  const nameInvalid = showNameError && !nameCheck.ok;

  function pick<K extends PartKind>(kind: K, id: AvatarData[K]) {
    setAvatar((prev) => ({ ...prev, [kind]: id }));
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex == null) return;
    e.preventDefault();
    const target = TABS[nextIndex];
    setTab(target.id);
    tabRefs.current[target.id]?.focus();
  }

  async function post(body: unknown): Promise<boolean> {
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setError("登入已經過期，請重新登入。");
        return false;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: unknown };
        setError(typeof data.message === "string" ? data.message : "存檔失敗，請再試一次。");
        return false;
      }
      return true;
    } catch {
      setError("網路連線出了問題，請再試一次。");
      return false;
    }
  }

  async function finish() {
    if (busy) return;
    setError(null);
    if (!nameCheck.ok) {
      setShowNameError(true);
      nameRef.current?.focus();
      return;
    }
    setBusy("save");
    const ok = await post({ avatar: { ...avatar, name: nameCheck.value } });
    if (ok) {
      router.push(next);
    } else setBusy(null);
  }

  async function skip() {
    if (busy) return;
    setError(null);
    setBusy("skip");
    const ok = await post({ skip: true });
    if (ok) {
      router.push(next);
    } else setBusy(null);
  }

  return (
    <div className={s.creator}>
      <div className={s.preview}>
        <Avatar avatar={{ ...avatar, name: shownName }} size={240} className={s.previewAvatar} title={`${shownName}的角色`} />
        <NamePlate name={shownName} />
      </div>

      <FloatCard strong as="section" className={s.card}>
        <div className={s.head}>
          {onboarding ? <p className={s.step}>步驟 1／2</p> : null}
          <h1 className={s.title}>{onboarding ? "做出你的角色" : "修改你的角色"}</h1>
        </div>
        <p className={s.lead}>選你喜歡的樣子。每一個選項都可以用，之後也能再改。</p>

        <div role="tablist" aria-label="角色部位" className={s.tabs}>
          {TABS.map((t, i) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                className={s.tab}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {TABS.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`${baseId}-panel-${t.id}`}
            aria-labelledby={`${baseId}-tab-${t.id}`}
            hidden={t.id !== tab}
            className={s.panel}
          >
            {t.groups.map((g) => (
              <div key={g.kind} role="group" aria-label={g.label} className={s.group}>
                {t.groups.length > 1 ? (
                  <p className={s.groupLabel} aria-hidden="true">
                    {g.label}
                  </p>
                ) : null}
                <div className={s.swatches}>
                  {AVATAR_PALETTES[g.kind].map((option) => (
                    <PartSwatch
                      key={option.id}
                      kind={g.kind}
                      optionId={option.id as AvatarData[typeof g.kind]}
                      avatar={avatar}
                      selected={avatar[g.kind] === option.id}
                      onSelect={(id) => pick(g.kind, id)}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className={s.field}>
          <label htmlFor={`${baseId}-name`} className={s.fieldLabel}>
            名字
          </label>
          <input
            ref={nameRef}
            id={`${baseId}-name`}
            type="text"
            autoComplete="nickname"
            value={nameDraft}
            onChange={(e) => {
              setNameDraft(e.target.value);
              const check = validateName(e.target.value);
              if (check.ok) setAvatar((prev) => ({ ...prev, name: check.value }));
            }}
            onBlur={() => setShowNameError(true)}
            aria-invalid={nameInvalid}
            aria-describedby={nameInvalid ? `${nameErrorId} ${nameHintId}` : nameHintId}
            className={s.input}
          />
          {nameInvalid && !nameCheck.ok ? (
            <p id={nameErrorId} className={s.fieldError}>
              <ErrorIcon />
              {nameCheck.reason}
            </p>
          ) : null}
          <p id={nameHintId} className={s.fieldHint}>
            {NAME_MIN} 到 {NAME_MAX} 個字，只能是文字。
          </p>
        </div>

        {error ? (
          <p role="alert" className={s.formError}>
            <ErrorIcon />
            {error}
          </p>
        ) : null}

        <div className={s.actions}>
          <PrimaryButton onClick={finish} aria-disabled={busy != null} className={s.mainBtn}>
            {busy === "save" ? "存檔中…" : "完成"}
          </PrimaryButton>
          {onboarding ? (
            <button type="button" className={s.textBtn} onClick={skip} aria-disabled={busy != null}>
              {busy === "skip" ? "略過中…" : "先跳過"}
            </button>
          ) : (
            <Link href={homeHref} className={s.textBtn}>
              取消
            </Link>
          )}
        </div>
      </FloatCard>
    </div>
  );
}

export function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={s.inlineIcon}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </svg>
  );
}

export default CharacterCreator;
