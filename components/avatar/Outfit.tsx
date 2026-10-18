/**
 * Outfit layer, in three pieces that interleave with the body:
 *  - OutfitSleeves: over the bare arms, under the hands.
 *  - OutfitTorso: the garment body and its details.
 *  - OutfitCollar: drawn after the neck (collars, neck openings, strings).
 * Each takes a `view` ('front' | 'back') and the outfit colors as props, so
 * an artist's outfit set can replace these paths without touching Avatar.tsx.
 *
 * Six everyday outfits, all open from the start (RULE 6). None is fancier
 * than another; color is the student's choice, never a reward.
 */
import type { OutfitId } from "@/lib/avatar";
import { isLight } from "@/lib/avatar";
import type { AvatarView } from "./Body";

export interface OutfitColorsProps {
  outfit: OutfitId;
  view: AvatarView;
  /** Main fabric. */
  color: string;
  /** Darker fabric for pockets, hems, cuffs. */
  shade: string;
  /** Lighter fabric for collars and highlights. */
  tint: string;
  /** Strings, buttons: reads on the fabric. */
  detail: string;
  /** Skin, for neck openings. */
  skin: string;
}

const SHORT_SLEEVES = new Set<OutfitId>(["tshirt", "polo"]);
const TORSO = { x: 64, y: 116, width: 92, height: 104, rx: 34 };

export function OutfitSleeves({ outfit, color, shade }: OutfitColorsProps) {
  if (SHORT_SLEEVES.has(outfit)) {
    return (
      <g>
        <rect x="46" y="126" width="24" height="40" rx="12" fill={color} />
        <rect x="150" y="126" width="24" height="40" rx="12" fill={color} />
        {outfit === "polo" ? (
          <path d="M47 160 L69 160 M151 160 L173 160" stroke={shade} strokeWidth="3" strokeLinecap="round" />
        ) : null}
      </g>
    );
  }
  const cuffs = outfit === "jacket" || outfit === "sweater";
  return (
    <g>
      <rect x="46" y="126" width="24" height="80" rx="12" fill={color} />
      <rect x="150" y="126" width="24" height="80" rx="12" fill={color} />
      {cuffs ? (
        <g fill={shade}>
          <rect x="46" y="190" width="24" height="14" rx="6" />
          <rect x="150" y="190" width="24" height="14" rx="6" />
        </g>
      ) : null}
    </g>
  );
}

export function OutfitTorso({ outfit, view, color, shade, tint, detail }: OutfitColorsProps) {
  const front = view === "front";
  const base = <rect {...TORSO} fill={color} />;
  switch (outfit) {
    case "hoodie":
      return front ? (
        <g>
          {base}
          <rect x="84" y="180" width="52" height="22" rx="10" fill={shade} />
          <ellipse cx="110" cy="120" rx="34" ry="12" fill={shade} />
        </g>
      ) : (
        <g>
          {base}
          <path d="M80 116 Q110 106 140 116 Q138 152 110 158 Q82 152 80 116 Z" fill={shade} />
        </g>
      );
    case "uniformShirt":
      return front ? (
        <g>
          {base}
          <path d="M110 128 L110 216" stroke={shade} strokeWidth="2" />
          <g fill={shade}>
            <circle cx="110" cy="142" r="2.5" />
            <circle cx="110" cy="160" r="2.5" />
            <circle cx="110" cy="178" r="2.5" />
            <circle cx="110" cy="196" r="2.5" />
          </g>
          <rect x="120" y="140" width="20" height="18" rx="3" fill="none" stroke={shade} strokeWidth="2" />
        </g>
      ) : (
        <g>
          {base}
          <path d="M68 142 Q110 150 152 142" stroke={shade} strokeWidth="2" fill="none" />
        </g>
      );
    case "tshirt":
      return (
        <g>
          {base}
          <path d="M70 206 Q110 214 150 206" stroke={shade} strokeWidth="2" fill="none" />
        </g>
      );
    case "jacket": {
      return front ? (
        <g>
          {base}
          {/* Inner tee shows down the open front. */}
          <rect x="99" y="118" width="22" height="101" fill={isLight(color) ? "#2B3440" : "#F4F6F8"} />
          <path d="M99 120 L99 218 M121 120 L121 218" stroke={shade} strokeWidth="2.5" />
          <path d="M76 186 L92 182 M128 182 L144 186" stroke={shade} strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {base}
          <path d="M110 124 L110 214" stroke={shade} strokeWidth="2" />
        </g>
      );
    }
    case "sweater":
      return (
        <g>
          {base}
          {front ? (
            <path
              d="M66 152 L74 146 L82 152 L90 146 L98 152 L106 146 L114 152 L122 146 L130 152 L138 146 L146 152 L154 146"
              stroke={tint}
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          <rect x="68" y="200" width="84" height="16" rx="8" fill={shade} />
        </g>
      );
    case "polo":
      return front ? (
        <g>
          {base}
          <rect x="106" y="120" width="8" height="28" rx="3" fill={shade} />
          <g fill={detail}>
            <circle cx="110" cy="132" r="2" />
            <circle cx="110" cy="142" r="2" />
          </g>
        </g>
      ) : (
        base
      );
  }
}

export function OutfitCollar({ outfit, view, shade, tint, detail, skin }: OutfitColorsProps) {
  const front = view === "front";
  switch (outfit) {
    case "hoodie":
      return front ? (
        <g stroke={detail} strokeWidth="3" strokeLinecap="round">
          <line x1="102" y1="126" x2="102" y2="150" />
          <line x1="118" y1="126" x2="118" y2="150" />
        </g>
      ) : null;
    case "uniformShirt":
      return front ? (
        <g>
          <path d="M100 114 L110 128 L120 114 Z" fill={skin} />
          <path d="M97 110 L110 126 L101 136 L87 118 Z" fill={tint} />
          <path d="M123 110 L110 126 L119 136 L133 118 Z" fill={tint} />
        </g>
      ) : (
        <path d="M88 114 Q110 108 132 114 L132 122 Q110 117 88 122 Z" fill={tint} />
      );
    case "tshirt":
      return (
        <path
          d={front ? "M96 116 Q110 128 124 116" : "M94 116 Q110 122 126 116"}
          stroke={shade}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "jacket":
      return (
        <g fill={tint}>
          <path d="M86 112 L101 116 L99 130 L84 122 Z" />
          <path d="M134 112 L119 116 L121 130 L136 122 Z" />
          {front ? null : <path d="M88 112 Q110 106 132 112 L132 120 Q110 115 88 120 Z" />}
        </g>
      );
    case "sweater":
      return (
        <path
          d={front ? "M94 116 Q110 130 126 116" : "M92 116 Q110 122 128 116"}
          stroke={shade}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "polo":
      return front ? (
        <g fill={tint}>
          <path d="M94 111 L110 121 L104 131 L88 120 Z" />
          <path d="M126 111 L110 121 L116 131 L132 120 Z" />
        </g>
      ) : (
        <path d="M88 113 Q110 107 132 113 L132 121 Q110 116 88 121 Z" fill={tint} />
      );
  }
}
