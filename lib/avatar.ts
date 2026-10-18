import { z } from "zod";

/**
 * The student's character (01-DESIGN-SYSTEM §6.2), stored as JSON on the
 * student and validated on every read. AVATAR_VERSION 1.
 *
 * RULE 6 (00-MASTER-PROMPT, a teaching rule, not a style choice): no avatar
 * part or visual state may depend on money, spending, purchases or how far
 * the student has got in the course. Every option below is open to everyone
 * from the first screen. The only state the drawing reacts to besides the
 * chosen parts is `Mood`, which comes from the life game's stress level
 * (stress measures security, not wealth). tests/avatar.test.ts enforces this:
 * palettes carry only { id, label, hex? }, and the component props are fixed.
 *
 * The hex values here are the exact ones from §6.2. SVG art may also use
 * literal hex for fixed parts (trousers, shoes, eyes).
 */

export const AVATAR_VERSION = 1 as const;

/** One choosable option. Deliberately nothing else: no gate, no cost. */
export interface PartOption<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
}
export interface ColorOption<Id extends string = string> extends PartOption<Id> {
  readonly hex: string;
}

export const SKIN_TONES = [
  { id: "tone1", label: "膚色 1", hex: "#F3CDA6" },
  { id: "tone2", label: "膚色 2", hex: "#E8B88E" },
  { id: "tone3", label: "膚色 3", hex: "#D9A27A" },
  { id: "tone4", label: "膚色 4", hex: "#C68B62" },
  { id: "tone5", label: "膚色 5", hex: "#A86E4A" },
  { id: "tone6", label: "膚色 6", hex: "#7E5236" },
] as const satisfies readonly ColorOption[];

export const FACES = [
  { id: "smile", label: "微笑" },
  { id: "grin", label: "大笑" },
  { id: "calm", label: "平靜" },
  { id: "glassesSmile", label: "眼鏡" },
  { id: "frecklesSmile", label: "雀斑" },
  { id: "wink", label: "眨眼" },
] as const satisfies readonly PartOption[];

export const HAIRS = [
  { id: "short", label: "短髮" },
  { id: "sidePart", label: "旁分" },
  { id: "buzz", label: "平頭" },
  { id: "bob", label: "鮑伯頭" },
  { id: "longStraight", label: "長直髮" },
  { id: "ponytail", label: "馬尾" },
  { id: "curly", label: "捲髮" },
  { id: "bun", label: "包包頭" },
] as const satisfies readonly PartOption[];

export const HAIR_COLORS = [
  { id: "darkBrown", label: "深棕", hex: "#2A1E17" },
  { id: "brown", label: "棕色", hex: "#4A3426" },
  { id: "chestnut", label: "栗色", hex: "#7A5230" },
  { id: "caramel", label: "焦糖", hex: "#B07A3C" },
  { id: "black", label: "黑色", hex: "#1B1B1B" },
  { id: "plum", label: "梅紅", hex: "#8E3B5C" },
] as const satisfies readonly ColorOption[];

export const OUTFITS = [
  { id: "hoodie", label: "連帽衣" },
  { id: "uniformShirt", label: "制服襯衫" },
  { id: "tshirt", label: "T 恤" },
  { id: "jacket", label: "夾克" },
  { id: "sweater", label: "毛衣" },
  { id: "polo", label: "Polo 衫" },
] as const satisfies readonly PartOption[];

export const OUTFIT_COLORS = [
  { id: "blue", label: "藍色", hex: "#2F6FDB" },
  { id: "green", label: "綠色", hex: "#13906B" },
  { id: "rust", label: "磚紅", hex: "#C4471C" },
  { id: "purple", label: "紫色", hex: "#7A4FD0" },
  { id: "charcoal", label: "深灰", hex: "#2B3440" },
  { id: "mustard", label: "芥末黃", hex: "#B8860B" },
  { id: "berry", label: "莓紅", hex: "#C2185B" },
  { id: "mist", label: "淺灰", hex: "#E9EEF2" },
] as const satisfies readonly ColorOption[];

type Ids<T extends readonly PartOption[]> = T[number]["id"];
export type SkinId = Ids<typeof SKIN_TONES>;
export type FaceId = Ids<typeof FACES>;
export type HairId = Ids<typeof HAIRS>;
export type HairColorId = Ids<typeof HAIR_COLORS>;
export type OutfitId = Ids<typeof OUTFITS>;
export type OutfitColorId = Ids<typeof OUTFIT_COLORS>;

/** Every palette, keyed by the avatar field it fills. */
export const AVATAR_PALETTES = {
  skin: SKIN_TONES,
  face: FACES,
  hair: HAIRS,
  hairColor: HAIR_COLORS,
  outfit: OUTFITS,
  outfitColor: OUTFIT_COLORS,
} as const;
export type PartKind = keyof typeof AVATAR_PALETTES;
export const PART_KINDS = Object.keys(AVATAR_PALETTES) as PartKind[];

function ids<T extends readonly PartOption[]>(list: T) {
  return list.map((o) => o.id) as unknown as [Ids<T>, ...Ids<T>[]];
}

// ---------- name ----------

export const NAME_MIN = 2;
export const NAME_MAX = 8;

// C0/C1 controls plus invisible format characters (zero-width, bidi
// overrides) that could hide or reorder text.
const CONTROL_RE = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁩﻿]/;
const LINK_RE =
  /[a-z][a-z0-9+.-]*:\/\/|https?:|www\.|\.(com|net|org|edu|gov|tw|io|co|me|ly|app|dev|xyz|cc|info|link|site|top|shop)\b/i;
const ANGLE_RE = /[<>]/;

export type NameCheck = { ok: true; value: string } | { ok: false; reason: string };

/** Plain-text name, 2 to 8 characters after trimming. Stored as entered. */
export function validateName(name: unknown): NameCheck {
  if (typeof name !== "string") return { ok: false, reason: "請輸入名字。" };
  if (CONTROL_RE.test(name)) {
    return { ok: false, reason: "名字裡有看不見的特殊字元，請重新輸入。" };
  }
  const value = name.trim();
  if (ANGLE_RE.test(value)) return { ok: false, reason: "名字不能有 < 或 > 符號。" };
  if (LINK_RE.test(value)) return { ok: false, reason: "名字不能放連結。" };
  // Count characters the way a reader does (a surrogate pair is one).
  const length = Array.from(value).length;
  if (length === 0) return { ok: false, reason: "請輸入名字。" };
  if (length < NAME_MIN) return { ok: false, reason: `名字至少要 ${NAME_MIN} 個字。` };
  if (length > NAME_MAX) return { ok: false, reason: `名字最多 ${NAME_MAX} 個字。` };
  return { ok: true, value };
}

const NameSchema = z.string().transform((raw, ctx) => {
  const check = validateName(raw);
  if (!check.ok) {
    ctx.addIssue({ code: "custom", message: check.reason });
    return z.NEVER;
  }
  return check.value;
});

// ---------- schema ----------

export const AvatarSchema = z.object({
  version: z.literal(AVATAR_VERSION),
  skin: z.enum(ids(SKIN_TONES)),
  face: z.enum(ids(FACES)),
  hair: z.enum(ids(HAIRS)),
  hairColor: z.enum(ids(HAIR_COLORS)),
  outfit: z.enum(ids(OUTFITS)),
  outfitColor: z.enum(ids(OUTFIT_COLORS)),
  name: NameSchema,
});
export type Avatar = z.output<typeof AvatarSchema>;

/** The mockup's character (Main.dc.html). */
export const DEFAULT_AVATAR: Avatar = {
  version: AVATAR_VERSION,
  skin: "tone1",
  face: "smile",
  hair: "short",
  hairColor: "darkBrown",
  outfit: "hoodie",
  outfitColor: "blue",
  name: "小宇",
};

/** Parse a stored avatar (object or JSON string). Anything invalid is null. */
export function readAvatar(raw: unknown): Avatar | null {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  const parsed = AvatarSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

// ---------- mood ----------

/** The only visual state. Derived from stress (security), never from wealth. */
export type Mood = "calm" | "tense" | "stressed";
export const MOODS: readonly Mood[] = ["calm", "tense", "stressed"];

/** Same union as `StressLevel` in lib/lifeGame/stats.ts. */
export type StressLevelInput = "low" | "mid" | "high";

export function moodFromStressLevel(level: StressLevelInput): Mood {
  switch (level) {
    case "low":
      return "calm";
    case "mid":
      return "tense";
    case "high":
      return "stressed";
  }
}

// ---------- colors for the SVG parts ----------

function findHex(list: readonly ColorOption[], id: string): string {
  return (list.find((o) => o.id === id) ?? list[0]).hex;
}
export const skinHex = (id: SkinId) => findHex(SKIN_TONES, id);
export const hairHex = (id: HairColorId) => findHex(HAIR_COLORS, id);
export const outfitHex = (id: OutfitColorId) => findHex(OUTFIT_COLORS, id);

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
/** Mix toward black. amount 0..1. */
export function shade(hex: string, amount: number): string {
  return toHex(toRgb(hex).map((c) => c * (1 - amount)) as [number, number, number]);
}
/** Mix toward white. amount 0..1. */
export function tint(hex: string, amount: number): string {
  return toHex(toRgb(hex).map((c) => c + (255 - c) * amount) as [number, number, number]);
}
/** True for pale colors where white details would disappear. */
export function isLight(hex: string): boolean {
  const [r, g, b] = toRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 186;
}

/** The colors every layer needs, resolved once per render. */
export interface AvatarColors {
  skin: string;
  /** Ears. */
  skinShade: string;
  /** Neck, a little deeper (it sits in the head's shadow). */
  neck: string;
  hair: string;
  hairShade: string;
  outfit: string;
  outfitShade: string;
  outfitTint: string;
  /** Detail color that reads on the outfit (strings, buttons). */
  outfitDetail: string;
}

export function avatarColors(a: Pick<Avatar, "skin" | "hairColor" | "outfitColor">): AvatarColors {
  const skin = skinHex(a.skin);
  const hair = hairHex(a.hairColor);
  const outfit = outfitHex(a.outfitColor);
  const light = isLight(outfit);
  return {
    skin,
    skinShade: shade(skin, 0.04),
    neck: shade(skin, 0.08),
    hair,
    hairShade: isLight(hair) ? shade(hair, 0.3) : tint(hair, 0.18),
    outfit,
    outfitShade: shade(outfit, light ? 0.12 : 0.14),
    outfitTint: light ? shade(outfit, 0.06) : tint(outfit, 0.22),
    outfitDetail: light ? "#8C99A3" : "#FFFFFF",
  };
}
