/**
 * Hair layer, in three pieces so long styles sit in the right z-order:
 *  - HairBehind: front view, drawn before the body (long hair behind the
 *    shoulders, the ponytail, the bun).
 *  - HairFront: front view, drawn last (fringe, side curtains over the ears).
 *  - HairRear: back view (train transition), drawn over the head and back so
 *    the hair covers the face.
 *
 * All pieces take the hair color and a shade for details as props, so an
 * artist's hair set can replace these paths without touching Avatar.tsx.
 * Paths only (no <polygon>), in the shared 220×320 viewBox.
 */
import type { HairId } from "@/lib/avatar";

interface HairProps {
  hair: HairId;
  color: string;
  shade: string;
}

// The mockup's short cut (Main.dc.html).
const SHORT_FRONT =
  "M68 78 Q64 30 112 30 Q158 32 152 80 Q148 60 136 52 Q128 66 110 62 Q94 64 86 54 Q74 62 68 78 Z";
// Back of the head down to the nape; skin shows below it.
const CAP_REAR =
  "M68 78 Q64 30 110 30 Q156 30 152 78 Q150 100 138 108 Q110 116 82 108 Q70 100 68 78 Z";

// Curls: circles in a cloud, shared by front and rear.
const CURLS_TOP: [number, number, number][] = [
  [72, 68, 12],
  [76, 50, 13],
  [92, 37, 13],
  [110, 33, 13],
  [128, 37, 13],
  [144, 50, 13],
  [148, 68, 12],
  [90, 55, 10],
  [108, 53, 10],
  [127, 55, 10],
];

function Circles({ list, fill }: { list: [number, number, number][]; fill: string }) {
  return (
    <g fill={fill}>
      {list.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  );
}

export function HairBehind({ hair, color }: HairProps) {
  switch (hair) {
    case "bob":
      return (
        <path
          d="M64 80 Q60 28 110 28 Q160 28 156 80 L158 112 Q140 118 128 112 L92 112 Q80 118 62 112 Z"
          fill={color}
        />
      );
    case "longStraight":
      return (
        <path
          d="M62 80 Q58 26 110 26 Q162 26 158 80 L162 168 Q150 176 136 170 L84 170 Q70 176 58 168 Z"
          fill={color}
        />
      );
    case "ponytail":
      return (
        <path d="M138 48 Q178 50 174 98 Q172 128 158 142 Q164 112 150 90 Z" fill={color} />
      );
    case "curly":
      return (
        <Circles
          list={[
            [64, 84, 13],
            [156, 84, 13],
            [66, 100, 11],
            [154, 100, 11],
          ]}
          fill={color}
        />
      );
    case "bun":
      return <circle cx="110" cy="30" r="18" fill={color} />;
    default:
      return null;
  }
}

export function HairFront({ hair, color, shade }: HairProps) {
  switch (hair) {
    case "short":
      return <path d={SHORT_FRONT} fill={color} />;
    case "sidePart":
      return (
        <g>
          <path
            d="M68 84 Q62 30 110 28 Q158 30 152 82 Q150 62 142 52 Q122 50 98 66 Q86 72 77 70 Q70 75 68 84 Z"
            fill={color}
          />
          <path d="M128 31 Q133 40 141 51" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "buzz":
      return (
        <path
          d="M71 72 Q72 34 110 34 Q148 34 149 72 Q146 56 134 50 Q110 46 86 50 Q74 56 71 72 Z"
          fill={color}
        />
      );
    case "bob":
      return (
        <path
          d="M66 100 Q60 30 110 28 Q160 30 154 100 L154 112 Q146 114 140 110 Q144 84 142 66 Q138 60 128 60 L92 60 Q82 60 78 66 Q76 84 80 110 Q74 114 66 112 Z"
          fill={color}
        />
      );
    case "longStraight":
      return (
        <path
          d="M66 110 Q60 28 110 28 Q160 28 154 110 L160 160 Q152 166 144 162 L142 110 Q144 80 140 64 Q128 52 112 40 Q100 52 82 62 Q76 80 78 110 L76 162 Q68 166 60 160 Z"
          fill={color}
        />
      );
    case "ponytail":
      return (
        <g>
          <path
            d="M68 80 Q64 30 110 30 Q156 30 152 80 Q148 58 132 50 Q112 46 96 54 Q80 60 68 80 Z"
            fill={color}
          />
          <path d="M150 54 Q156 50 160 54" stroke={shade} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "curly":
      return <Circles list={CURLS_TOP} fill={color} />;
    case "bun":
      return (
        <g>
          <path
            d="M68 80 Q64 34 110 34 Q156 34 152 80 Q146 56 128 50 Q110 46 92 50 Q74 56 68 80 Z"
            fill={color}
          />
          <path d="M98 40 Q110 36 122 40" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

export function HairRear({ hair, color, shade }: HairProps) {
  switch (hair) {
    case "short":
    case "sidePart":
      return <path d={CAP_REAR} fill={color} />;
    case "buzz":
      return (
        <path
          d="M70 76 Q70 34 110 34 Q150 34 150 76 Q148 100 136 106 Q110 112 84 106 Q72 100 70 76 Z"
          fill={color}
        />
      );
    case "bob":
      return (
        <path d="M64 80 Q60 28 110 28 Q160 28 156 80 L158 112 Q110 122 62 112 Z" fill={color} />
      );
    case "longStraight":
      return (
        <path d="M62 80 Q58 26 110 26 Q162 26 158 80 L162 170 Q110 184 58 170 Z" fill={color} />
      );
    case "ponytail":
      return (
        <g>
          <path d={CAP_REAR} fill={color} />
          <path d="M101 70 Q110 64 119 70 Q126 110 118 150 Q110 160 102 150 Q94 110 101 70 Z" fill={color} />
          <circle cx="110" cy="70" r="6" fill={shade} />
        </g>
      );
    case "curly":
      return (
        <g>
          <ellipse cx="110" cy="74" rx="42" ry="42" fill={color} />
          <Circles
            list={[
              ...CURLS_TOP.slice(0, 7),
              [68, 88, 12],
              [152, 88, 12],
              [78, 104, 12],
              [94, 112, 12],
              [110, 114, 12],
              [126, 112, 12],
              [142, 104, 12],
            ]}
            fill={color}
          />
        </g>
      );
    case "bun":
      return (
        <g>
          <path d={CAP_REAR} fill={color} />
          <circle cx="110" cy="34" r="18" fill={color} />
          <path d="M100 32 Q110 24 120 32" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}
