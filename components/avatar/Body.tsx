/**
 * Body and skin layer of the character (01-DESIGN-SYSTEM §6.2).
 *
 * Every layer in components/avatar is a plain SVG fragment in the shared
 * 220×320 viewBox from the mockups (Main.dc.html, Transition.dc.html) and
 * takes its colors as props. To swap in a real artist's parts later, replace
 * the paths inside a layer and keep its props: Avatar.tsx only decides order
 * and colors. Fixed parts (trousers, shoes, floor shadow) use literal hex,
 * which the shared brief allows inside SVG art.
 *
 * RULE 6: nothing here may vary with anything but the chosen parts and mood.
 */

export type AvatarView = "front" | "back";

const INK = "#16202A";
const TROUSERS = "#33475B";
const SHOE = "#F4F6F8";
const SOLE = "#2B3440";

/** Soft shadow on the platform floor under the feet. */
export function FloorShadow() {
  return <ellipse cx="110" cy="308" rx="70" ry="9" fill={INK} opacity="0.18" />;
}

/** Legs, shoes and soles. Same from both sides. */
export function Legs() {
  return (
    <g>
      <rect x="86" y="206" width="22" height="92" rx="9" fill={TROUSERS} />
      <rect x="112" y="206" width="22" height="92" rx="9" fill={TROUSERS} />
      <rect x="78" y="290" width="34" height="14" rx="7" fill={SHOE} />
      <rect x="108" y="290" width="34" height="14" rx="7" fill={SHOE} />
      <rect x="78" y="300" width="34" height="5" rx="2" fill={SOLE} />
      <rect x="108" y="300" width="34" height="5" rx="2" fill={SOLE} />
    </g>
  );
}

/** Bare arms. The outfit's sleeves are drawn over them. */
export function Arms({ skin }: { skin: string }) {
  return (
    <g>
      <rect x="46" y="126" width="24" height="80" rx="12" fill={skin} />
      <rect x="150" y="126" width="24" height="80" rx="12" fill={skin} />
    </g>
  );
}

export function Hands({ skin }: { skin: string }) {
  return (
    <g>
      <circle cx="58" cy="208" r="10" fill={skin} />
      <circle cx="162" cy="208" r="10" fill={skin} />
    </g>
  );
}

export function Neck({ neck }: { neck: string }) {
  return <rect x="100" y="102" width="20" height="18" rx="6" fill={neck} />;
}

export function Ears({ skinShade }: { skinShade: string }) {
  return (
    <g>
      <circle cx="70" cy="82" r="9" fill={skinShade} />
      <circle cx="150" cy="82" r="9" fill={skinShade} />
    </g>
  );
}

export function Head({ skin }: { skin: string }) {
  return <ellipse cx="110" cy="78" rx="40" ry="42" fill={skin} />;
}
