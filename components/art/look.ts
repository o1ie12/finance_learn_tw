/**
 * The character's options (06 E10.3), stored on the profile as
 * { skin, face, hairStyle, hair, outfit, outfitColor, name }. Nothing locked.
 * Art colors: the only place raw hex is allowed besides the scenes (E2.1).
 */
export const SKINS = ["#F3CDA6", "#E8B88E", "#D9A27A", "#C68B62", "#A86E4A", "#7E5236"] as const;
export const FACES = ["smile", "grin", "calm", "glasses", "freckles", "wink"] as const;
export const HAIR_STYLES = ["short", "side", "buzz", "bob", "long", "ponytail", "curly", "bun"] as const;
export const HAIR_COLORS = ["#2A1E17", "#4A3426", "#7A5230", "#B07A3C", "#1B1B1B", "#8E3B5C"] as const;
export const OUTFITS = ["hoodie", "uniform", "tee", "jacket", "sweater", "polo"] as const;
export const OUTFIT_COLORS = ["#2F6FDB", "#13906B", "#C4471C", "#7A4FD0", "#2B3440", "#B8860B", "#C2185B", "#E9EEF2"] as const;
export const MOODS = ["calm", "happy", "worried", "stressed", "thinking", "proud"] as const;

export type Face = (typeof FACES)[number];
export type HairStyle = (typeof HAIR_STYLES)[number];
export type Outfit = (typeof OUTFITS)[number];
export type Mood = (typeof MOODS)[number];

export interface Look {
  skin: string;
  face: Face;
  hairStyle: HairStyle;
  hair: string;
  outfit: Outfit;
  outfitColor: string;
  name: string;
}

export const DEFAULT_LOOK: Look = {
  skin: SKINS[1],
  face: "smile",
  hairStyle: "short",
  hair: HAIR_COLORS[0],
  outfit: "hoodie",
  outfitColor: OUTFIT_COLORS[0],
  name: "小宇",
};

/** Mood in words, for the character's accessible name (E10.6). */
export const MOOD_WORDS: Record<Mood, string> = {
  calm: "很平靜",
  happy: "很開心",
  worried: "有點擔心",
  stressed: "壓力很大",
  thinking: "正在想",
  proud: "很驕傲",
};
