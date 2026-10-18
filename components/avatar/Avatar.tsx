/**
 * The student's character (01-DESIGN-SYSTEM §6.2), composed from the layer
 * components in this folder in the mockup's 220×320 viewBox.
 *
 * Layers are swappable: Body, Face, Hair and Outfit each take colors as
 * props and only draw paths. A real artist's parts can replace any of them
 * as long as they keep the same props and viewBox. This file only fixes the
 * z-order and resolves colors from lib/avatar.ts.
 *
 * RULE 6 (teaching rule): no part or visual state may depend on money,
 * spending, purchases or course standing. The props below are the whole
 * input: the chosen parts (`avatar`) and `mood`, which comes from the life
 * game's stress level (security, not wealth). tests/avatar.test.ts reads
 * this file and fails if any other prop appears.
 */
import type { Avatar as AvatarData, Mood } from "@/lib/avatar";
import { avatarColors } from "@/lib/avatar";
import { Arms, Ears, FloorShadow, Hands, Head, Legs, Neck, type AvatarView } from "./Body";
import { Face } from "./Face";
import { HairBehind, HairFront, HairRear } from "./Hair";
import { OutfitCollar, OutfitSleeves, OutfitTorso } from "./Outfit";

export type { AvatarView };

export const AVATAR_VIEWBOX = { width: 220, height: 320 } as const;

export interface AvatarProps {
  avatar: AvatarData;
  mood?: Mood;
  /** 'back' is drawn from behind (hair covers the face), for the train ride. */
  view?: AvatarView;
  /** Rendered width in px; height keeps the 220×320 ratio. Default 210. */
  size?: number;
  /** Accessible name, e.g. 「小宇的角色」. Without it the art is decorative. */
  title?: string;
  className?: string;
}

export interface AvatarArtProps {
  avatar: AvatarData;
  mood?: Mood;
  view?: AvatarView;
}

/** The layers in z-order, as SVG children. Used by Avatar and PartSwatch. */
export function AvatarArt({ avatar, mood = "calm", view = "front" }: AvatarArtProps) {
  const c = avatarColors(avatar);
  const outfitProps = {
    outfit: avatar.outfit,
    view,
    color: c.outfit,
    shade: c.outfitShade,
    tint: c.outfitTint,
    detail: c.outfitDetail,
    skin: c.neck,
  };
  const hairProps = { hair: avatar.hair, color: c.hair, shade: c.hairShade };
  const front = view === "front";
  return (
    <g>
      <FloorShadow />
      {front ? <HairBehind {...hairProps} /> : null}
      <Legs />
      <Arms skin={c.skin} />
      <OutfitSleeves {...outfitProps} />
      <Hands skin={c.skin} />
      <OutfitTorso {...outfitProps} />
      <Neck neck={c.neck} />
      <OutfitCollar {...outfitProps} />
      <Ears skinShade={c.skinShade} />
      <Head skin={c.skin} />
      {front ? (
        <>
          <Face face={avatar.face} mood={mood} skin={c.skin} />
          <HairFront {...hairProps} />
        </>
      ) : (
        <HairRear {...hairProps} />
      )}
    </g>
  );
}

export function Avatar({ avatar, mood = "calm", view = "front", size = 210, title, className }: AvatarProps) {
  const height = Math.round((size * AVATAR_VIEWBOX.height) / AVATAR_VIEWBOX.width);
  const a11y = title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true, focusable: false } as const);
  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${AVATAR_VIEWBOX.width} ${AVATAR_VIEWBOX.height}`}
      className={className}
      data-mood={mood}
      data-view={view}
      {...a11y}
    >
      <AvatarArt avatar={avatar} mood={mood} view={view} />
    </svg>
  );
}

export default Avatar;
