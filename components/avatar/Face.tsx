/**
 * Face layer: eyes, brows, cheeks, mouth and the face extras (glasses,
 * freckles). Front view only; from behind the hair covers the face.
 *
 * Mood changes the face a little and nothing else (RULE 6: the character
 * shows security, never stuff):
 *  - calm: the chosen face as drawn.
 *  - tense: flat mouth and a slight brow.
 *  - stressed: worried brows (inner ends raised) and a small frown.
 * Closed-eye faces (calm, wink) open their eyes when not calm, so the
 * expression stays readable at 120px.
 *
 * Colors come in as props so an artist's face set can replace these paths.
 */
import type { FaceId, Mood } from "@/lib/avatar";
import { shade } from "@/lib/avatar";

const INK = "#16202A";
const BLUSH = "#F2A08A";

function OpenEye({ cx }: { cx: number }) {
  return (
    <g>
      <ellipse cx={cx} cy="84" rx="4.5" ry="5.5" fill={INK} />
      <circle cx={cx + 1.5} cy="82" r="1.5" fill="#FFFFFF" />
    </g>
  );
}

function ClosedEye({ cx }: { cx: number }) {
  return (
    <path
      d={`M${cx - 5} 85 Q${cx} 80 ${cx + 5} 85`}
      stroke={INK}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Brows({ mood, lift }: { mood: Mood; lift: boolean }) {
  if (mood === "calm") return null;
  const d =
    mood === "tense"
      ? // Slight: nearly level, inner ends a hair lower.
        "M89 74 L101 74.8 M119 74.8 L131 74"
      : // Worried: inner ends raised.
        "M88 75.5 Q95 74.5 101 70.5 M119 70.5 Q125 74.5 132 75.5";
  return (
    <path
      d={d}
      // Sit above the frames when wearing glasses.
      transform={lift ? "translate(0 -5)" : undefined}
      stroke={INK}
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Mouth({ face, mood }: { face: FaceId; mood: Mood }) {
  const line = { stroke: INK, strokeWidth: 3.2, fill: "none", strokeLinecap: "round" as const };
  if (mood === "tense") return <path d="M102 104 L118 104" {...line} />;
  if (mood === "stressed") return <path d="M103 106 Q110 101 117 106" {...line} />;
  if (face === "grin") {
    return (
      <g>
        <path d="M98 100 Q110 102 122 100 Q119 114 110 114 Q101 114 98 100 Z" fill={INK} />
        <path d="M103 109 Q110 106 117 109 Q114 113 110 113 Q106 113 103 109 Z" fill="#E8857A" />
      </g>
    );
  }
  if (face === "calm") return <path d="M103 103 Q110 107.5 117 103" {...line} />;
  return <path d="M100 102 Q110 110 120 102" {...line} />;
}

function Glasses() {
  return (
    <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round">
      <circle cx="95" cy="84" r="10" fill="#FFFFFF" fillOpacity="0.18" />
      <circle cx="125" cy="84" r="10" fill="#FFFFFF" fillOpacity="0.18" />
      <path d="M105 83 Q110 80 115 83" />
      <path d="M85 82 L72 79 M135 82 L148 79" />
    </g>
  );
}

function Freckles({ skin }: { skin: string }) {
  const fill = shade(skin, 0.32);
  const dots: [number, number][] = [
    [82, 93],
    [87, 96],
    [80, 98],
    [138, 93],
    [133, 96],
    [140, 98],
  ];
  return (
    <g fill={fill}>
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" />
      ))}
    </g>
  );
}

export function Face({ face, mood, skin }: { face: FaceId; mood: Mood; skin: string }) {
  const calm = mood === "calm";
  const leftClosed = calm && face === "calm";
  const rightClosed = calm && (face === "calm" || face === "wink");
  return (
    <g>
      <ellipse cx="86" cy="98" rx="7" ry="4" fill={BLUSH} opacity="0.55" />
      <ellipse cx="134" cy="98" rx="7" ry="4" fill={BLUSH} opacity="0.55" />
      {face === "frecklesSmile" ? <Freckles skin={skin} /> : null}
      {leftClosed ? <ClosedEye cx={95} /> : <OpenEye cx={95} />}
      {rightClosed ? <ClosedEye cx={125} /> : <OpenEye cx={125} />}
      <Brows mood={mood} lift={face === "glassesSmile"} />
      {face === "glassesSmile" ? <Glasses /> : null}
      <Mouth face={face} mood={mood} />
    </g>
  );
}
