"use client";

/**
 * One option in the character creator's tabs (01-DESIGN-SYSTEM §6.2): a
 * 64×64 button with the part drawn on it, using the student's current
 * choices for everything else so they see the option in context.
 *
 * Every option is always selectable. There is deliberately no disabled or
 * gated state here (RULE 6: nothing is held back for money or standing).
 */
import type { Avatar, PartKind } from "@/lib/avatar";
import { AvatarArt } from "./Avatar";

/** Which part of the 220×320 art each kind of swatch zooms into. */
const CROP: Record<PartKind, string> = {
  skin: "60 28 100 100",
  face: "64 40 92 92",
  hair: "32 14 156 156",
  hairColor: "32 14 156 156",
  outfit: "26 98 168 168",
  outfitColor: "26 98 168 168",
};

export interface PartSwatchProps<K extends PartKind> {
  kind: K;
  optionId: Avatar[K];
  /** The student's current choices; the swatch swaps in `optionId`. */
  avatar: Avatar;
  selected: boolean;
  onSelect: (optionId: Avatar[K]) => void;
  /** Accessible name, e.g. the option's label 「馬尾」. */
  label: string;
}

export function PartSwatch<K extends PartKind>({
  kind,
  optionId,
  avatar,
  selected,
  onSelect,
  label,
}: PartSwatchProps<K>) {
  const preview: Avatar = { ...avatar, [kind]: optionId };
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onClick={() => onSelect(optionId)}
      className={[
        "relative inline-flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden",
        "rounded-[var(--radius-inner)] bg-[var(--card-strong)]",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
        selected
          ? "border-[3px] border-[var(--ink)]"
          : "border border-[var(--track)] hover:border-[var(--ink-muted)]",
      ].join(" ")}
    >
      <svg viewBox={CROP[kind]} width="56" height="56" aria-hidden="true" focusable="false">
        <AvatarArt avatar={preview} />
      </svg>
      {selected ? (
        // A shape cue as well as the border, so color is never the only signal.
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ink)]"
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="var(--ink-inverse)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}

export default PartSwatch;
