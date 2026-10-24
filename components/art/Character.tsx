"use client";

/**
 * The character (06 E10), v2 geometry from E10.2: viewBox 0 -20 240 350,
 * a 3.5px #1B2430 outline on every body shape, flat fills with one soft
 * shade strip, big dot eyes with two highlights, blush. The hair styles,
 * outfits and mood faces are drawn to E10.3 and E10.4's descriptions: the
 * prototype's character.js is not in the repo, so these parts are this
 * file's own geometry and are flagged for review at STOP 1.
 *
 * Never a button, never moves on tap (E10.5). Idle and blink stop under
 * reduced motion, the low-end flag, a hidden tab, or offscreen.
 */
import { useEffect, useId, useRef, useState } from "react";
import { MOOD_WORDS, type Face, type HairStyle, type Look, type Mood, type Outfit } from "./look";
import s from "./character.module.css";

const LINE = "#1B2430";
const INK = "#15202B";
const SW = 3.5;
const O = { stroke: LINE, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Mix a #rrggbb color toward black by pct (0..100): the one shade per part. */
function shade(hex: string, pct: number): string {
  const k = 1 - pct / 100;
  const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ---------------------------------------------------------------------------
// Hair
// ---------------------------------------------------------------------------

function hairBack(style: HairStyle, color: string) {
  switch (style) {
    case "bob":
      return <rect x="34" y="26" width="172" height="124" rx="62" fill={color} {...O} />;
    case "long":
      return (
        <path
          d="M38 92C38 44 76 18 120 18s82 26 82 74l4 112c0 12-22 14-30 6l-6-66H70l-6 66c-8 8-30 6-30-6z"
          fill={color}
          {...O}
        />
      );
    case "ponytail":
      return (
        <>
          <path d="M186 58c26 4 34 30 26 58-6 22-18 34-26 38 4-20 6-48-8-70z" fill={color} {...O} />
          <rect x="178" y="54" width="16" height="14" rx="5" fill={shade(color, 30)} {...O} />
        </>
      );
    case "curly":
      return <circle cx="120" cy="80" r="86" fill={color} {...O} />;
    case "bun":
      return <circle cx="120" cy="14" r="22" fill={color} {...O} />;
    default:
      return null;
  }
}

function hairFront(style: HairStyle, color: string) {
  const d: Record<HairStyle, string> = {
    short: "M47 94C42 50 78 22 120 22s78 28 73 72c-12-20-34-30-56-30-6 8-16 12-28 10-14 6-34 10-62 20z",
    side: "M47 98C38 48 78 18 124 20c44 2 74 32 69 78-16-24-48-38-86-20-20-6-42 2-60 20z",
    buzz: "M52 82C56 46 86 28 120 28s64 18 68 54c-20-16-44-22-68-22s-48 6-68 22z",
    bob: "M48 100C44 52 80 22 120 22s76 30 72 78v-14c-18-18-42-24-72-24S66 68 48 86z",
    long: "M47 96C42 50 78 20 120 20s78 30 73 76c-20-22-46-30-73-12-27-18-53-10-73 12z",
    ponytail: "M47 92C42 50 78 22 120 22s78 28 73 70c-22-18-46-26-73-26S70 74 47 92z",
    curly: "M46 98c-8-26 4-40 10-42-2-24 22-30 28-28 8-18 32-14 38-6 12-12 34-6 40 8 22-4 32 16 28 30 16 10 12 28 6 38-22-24-50-32-76-30s-54 8-74 30z",
    bun: "M47 92C42 50 78 22 120 22s78 28 73 70c-22-18-46-26-73-26S70 74 47 92z",
  };
  return <path d={d[style]} fill={color} {...O} />;
}

// ---------------------------------------------------------------------------
// Face (mood first, then the chosen face's mouth and accessories)
// ---------------------------------------------------------------------------

const EYES: [number, number][] = [
  [92, 98],
  [148, 98],
];

function eyes(mood: Mood, face: Face) {
  if (mood === "proud") {
    return EYES.map(([x, y]) => <path key={x} d={`M${x - 9} ${y + 2}q9-11 18 0`} fill="none" {...O} stroke={INK} />);
  }
  const dx = mood === "thinking" ? 3 : 0;
  const dy = mood === "thinking" ? -3 : 0;
  return EYES.map(([x, y], i) =>
    face === "wink" && i === 0 && (mood === "calm" || mood === "happy") ? (
      <path key={x} d={`M${x - 9} ${y}q9 7 18 0`} fill="none" {...O} stroke={INK} />
    ) : (
      <g key={x}>
        <ellipse cx={x + dx} cy={y + dy} rx="8.5" ry="10.5" fill={INK} />
        <circle cx={x + dx + 3} cy={y + dy - 4} r="3.4" fill="#fff" />
        <circle cx={x + dx - 3} cy={y + dy + 4} r="1.4" fill="#fff" />
      </g>
    ),
  );
}

function brows(mood: Mood) {
  const p: Partial<Record<Mood, string>> = {
    happy: "M80 78q11-8 22 0M138 78q11-8 22 0",
    worried: "M82 82l18-7M158 82l-18-7",
    stressed: "M82 86l20-12M158 86l-20-12",
  };
  return p[mood] ? <path d={p[mood]} fill="none" {...O} stroke={INK} /> : null;
}

function mouth(mood: Mood, face: Face) {
  const open = "M106 124q14 22 28 0z";
  switch (mood) {
    case "happy":
    case "proud":
      return <path d={open} fill="#7A2630" {...O} />;
    case "worried":
      return <path d="M110 133q10-7 20 0" fill="none" {...O} stroke={INK} />;
    case "stressed":
      return <path d="M105 131l5-5 5 5 5-5 5 5 5-5 5 5" fill="none" {...O} stroke={INK} />;
    case "thinking":
      return <path d="M112 130h16" fill="none" {...O} stroke={INK} />;
    default:
      if (face === "grin") return <path d={open} fill="#7A2630" {...O} />;
      if (face === "calm") return <path d="M112 129q8 4 16 0" fill="none" {...O} stroke={INK} />;
      return <path d="M108 127q12 10 24 0" fill="none" {...O} stroke={INK} />;
  }
}

function extras(mood: Mood, face: Face) {
  return (
    <>
      {face === "glasses" ? (
        <g fill="none" stroke={INK} strokeWidth="3">
          <circle cx="92" cy="98" r="16" />
          <circle cx="148" cy="98" r="16" />
          <path d="M108 97q12-6 24 0" />
        </g>
      ) : null}
      {face === "freckles" ? (
        <g fill={shade("#C68B62", 20)}>
          <circle cx="64" cy="112" r="2" />
          <circle cx="72" cy="120" r="2" />
          <circle cx="80" cy="113" r="2" />
          <circle cx="160" cy="113" r="2" />
          <circle cx="168" cy="120" r="2" />
          <circle cx="176" cy="112" r="2" />
        </g>
      ) : null}
      {mood === "stressed" ? <path d="M182 64c6 8 9 13 9 18a9 9 0 0 1-18 0c0-5 3-10 9-18z" fill="#8FD3FF" {...O} strokeWidth="2.5" /> : null}
      {mood === "thinking" ? (
        <g fill="none" {...O} stroke={INK}>
          <path d="M200 20q8-9 17-1 6 8-7 13v6" />
          <circle cx="210" cy="47" r="1.6" fill={INK} />
        </g>
      ) : null}
      {mood === "proud"
        ? [
            [26, 54],
            [210, 40],
          ].map(([x, y]) => <path key={x} d={`M${x} ${y - 10}l3 7 7 3-7 3-3 7-3-7-7-3 7-3z`} fill="#F2C200" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />)
        : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Outfit
// ---------------------------------------------------------------------------

const SHORT_SLEEVES: Outfit[] = ["tee", "polo"];

function outfitParts(outfit: Outfit, color: string) {
  const dark = shade(color, 22);
  const white = "#F4F6F8";
  switch (outfit) {
    case "hoodie":
      return (
        <>
          <path d="M92 166q28 26 56 0" fill={dark} {...O} />
          <path d="M112 178l-2 22M128 178l2 22" fill="none" {...O} strokeWidth="2.5" />
          <rect x="98" y="206" width="44" height="20" rx="8" fill={dark} stroke={LINE} strokeWidth="2.5" />
        </>
      );
    case "uniform":
      return (
        <>
          <path d="M104 162l16 16 16-16" fill={white} {...O} />
          <path d="M120 176l-6 8 6 26 6-26z" fill="#2B3440" {...O} strokeWidth="2.5" />
        </>
      );
    case "tee":
      return <path d="M104 162q16 16 32 0" fill="none" stroke={dark} strokeWidth="4" strokeLinecap="round" />;
    case "jacket":
      return (
        <>
          <rect x="108" y="161" width="24" height="82" fill={white} stroke={LINE} strokeWidth="2.5" />
          <path d="M108 162l-6 30 6 6M132 162l6 30-6 6" fill="none" {...O} strokeWidth="2.5" />
        </>
      );
    case "sweater":
      return (
        <>
          <path d="M104 162l16 22 16-22" fill={dark} {...O} strokeWidth="2.5" />
          <path d="M92 236v6M104 236v7M116 236v7M128 236v7M140 236v7M152 236v6" stroke={dark} strokeWidth="2.5" />
        </>
      );
    case "polo":
      return (
        <>
          <path d="M104 162l-4 12 14-2 6-10M136 162l4 12-14-2-6-10" fill={dark} {...O} strokeWidth="2.5" />
          <path d="M120 170v22" stroke={LINE} strokeWidth="2.5" />
          <circle cx="120" cy="179" r="2" fill={LINE} />
          <circle cx="120" cy="188" r="2" fill={LINE} />
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Character({
  look,
  mood = "calm",
  pose = "stand",
  facing = "front",
  width = 182,
  className,
}: {
  look: Look;
  mood?: Mood;
  pose?: "stand" | "wave";
  facing?: "front" | "back";
  width?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [paused, setPaused] = useState(false);
  const delay = useRef(`${(id.length * 37) % 3000}ms`);

  // Offscreen or hidden-tab characters pause (E17).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = true;
    const sync = () => setPaused(!inView || document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const { skin, hair, hairStyle, outfit, outfitColor, face } = look;
  const shortSleeve = SHORT_SLEEVES.includes(outfit);
  const skinShade = shade(skin, 14);
  const arm = (x: number, rot: number, wave = false) => (
    <g transform={wave ? "rotate(-125 158 172)" : `rotate(${rot} ${x < 120 ? 82 : 158} 172)`} className={wave ? s.wave : undefined}>
      {shortSleeve ? (
        <>
          <rect x={x + 3} y="190" width="18" height="50" rx="9" fill={skin} {...O} />
          <rect x={x} y="166" width="24" height="32" rx="12" fill={outfitColor} {...O} />
          <circle cx={x + 12} cy="242" r="12.5" fill={skin} {...O} />
        </>
      ) : (
        <>
          <rect x={x} y="166" width="24" height="70" rx="12" fill={outfitColor} {...O} />
          <circle cx={x + 12} cy="238" r="12.5" fill={skin} {...O} />
        </>
      )}
    </g>
  );

  const label = `${look.name}，${MOOD_WORDS[mood]}`;
  return (
    <svg
      ref={ref}
      viewBox="0 -20 240 350"
      width={width}
      height={(width * 350) / 240}
      role="img"
      aria-label={label}
      className={[s.root, paused && s.paused, className].filter(Boolean).join(" ")}
      style={{ "--blink-delay": delay.current } as React.CSSProperties}
    >
      <defs>
        <clipPath id={`t${id}`}>
          <rect x="82" y="160" width="76" height="84" rx="28" />
        </clipPath>
        <clipPath id={`h${id}`}>
          <rect x="45" y="30" width="150" height="128" rx="58" />
        </clipPath>
      </defs>
      <ellipse cx="120" cy="318" rx="62" ry="8" fill={INK} opacity=".18" />
      <g className={s.body}>
        {/* legs and shoes */}
        <rect x="90" y="236" width="28" height="52" rx="12" fill="#2B3440" {...O} />
        <rect x="122" y="236" width="28" height="52" rx="12" fill="#2B3440" {...O} />
        <rect x="122" y="236" width="28" height="52" rx="12" fill="#000" opacity=".1" />
        <rect x="83" y="278" width="42" height="28" rx="13" fill="#2A3340" {...O} />
        <rect x="115" y="278" width="42" height="28" rx="13" fill="#2A3340" {...O} />
        <rect x="86" y="298" width="36" height="5" rx="2.5" fill="#F4F6F8" />
        <rect x="118" y="298" width="36" height="5" rx="2.5" fill="#F4F6F8" />
        {/* back arm, torso, front arm */}
        {arm(58, 4)}
        <rect x="82" y="160" width="76" height="84" rx="28" fill={outfitColor} {...O} />
        <g clipPath={`url(#t${id})`}>
          <rect x="142" y="160" width="16" height="84" fill="#000" opacity=".1" />
          <rect x="82" y="232" width="76" height="12" fill="#000" opacity=".07" />
          {facing === "front" ? outfitParts(outfit, outfitColor) : null}
        </g>
        <rect x="82" y="160" width="76" height="84" rx="28" fill="none" {...O} />
        {arm(158, -4, pose === "wave")}
        {/* neck and head */}
        <rect x="104" y="150" width="32" height="22" rx="10" fill={skinShade} {...O} />
        <g className={s.head}>
          {hairBack(hairStyle, hair)}
          <circle cx="46" cy="102" r="12" fill={skin} {...O} />
          <circle cx="194" cy="102" r="12" fill={skin} {...O} />
          <rect x="45" y="30" width="150" height="128" rx="58" fill={facing === "back" ? hair : skin} {...O} />
          <g clipPath={`url(#h${id})`}>
            <rect x="175" y="30" width="20" height="128" fill="#000" opacity=".07" />
            <rect x="45" y="145" width="150" height="13" fill="#000" opacity=".06" />
          </g>
          <rect x="45" y="30" width="150" height="128" rx="58" fill="none" {...O} />
          {facing === "front" ? (
            <>
              <g key={mood} className={s.face}>
                <ellipse cx="72" cy="116" rx="11" ry="7" fill="#E5605A" opacity=".28" />
                <ellipse cx="168" cy="116" rx="11" ry="7" fill="#E5605A" opacity=".28" />
                <g className={s.eyes}>{eyes(mood, face)}</g>
                {mouth(mood, face)}
                {extras(mood, face)}
              </g>
              {hairFront(hairStyle, hair)}
              {/* Brows over the fringe, so a mood always reads. */}
              <g key={`b${mood}`} className={s.face}>
                {brows(mood)}
              </g>
            </>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
