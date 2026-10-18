import { Avatar } from "@/components/avatar/Avatar";
import { MoodBubble, type MoodLevel } from "@/components/game/MoodBubble";
import { moodFromStressLevel, type Avatar as AvatarData } from "@/lib/avatar";
import type { StressLevel } from "@/lib/lifeGame/stats";
import s from "./play.module.css";

/**
 * The small character at the bottom left (01 §6.4), mood updating live.
 * Uses the student's avatar when they have built one; otherwise a plain
 * placeholder figure (the spec's "plain shapes, no character art yet").
 */
export function PlayCharacter({
  avatar,
  name,
  level,
  mood,
}: {
  avatar: AvatarData | null;
  name: string;
  level: StressLevel;
  /** view.stress.mood, e.g. 「安心：有緊急預備金」. */
  mood: string;
}) {
  const moodLevel: MoodLevel = moodFromStressLevel(level);
  const reason = mood.includes("：") ? mood.slice(mood.indexOf("：") + 1) : mood;
  return (
    <aside className={s.character} aria-label={`${name}現在的心情`}>
      <MoodBubble level={moodLevel} reason={reason} className={s.characterMood} />
      <div className={s.characterFigure}>
        {avatar ? (
          <Avatar avatar={avatar} mood={moodLevel} size={120} />
        ) : (
          <PlaceholderFigure level={moodLevel} />
        )}
      </div>
      <p className={s.characterName}>{name}</p>
    </aside>
  );
}

/** Boxes first: a head, a body, a face that follows the mood. */
function PlaceholderFigure({ level }: { level: MoodLevel }) {
  const mouth =
    level === "calm" ? "M48 50q12 10 24 0" : level === "tense" ? "M48 54h24" : "M48 58q12 -10 24 0";
  return (
    <svg viewBox="0 0 120 175" width={120} height={175} aria-hidden="true" focusable="false" className={s.placeholder}>
      <rect x="30" y="8" width="60" height="62" rx="18" className={s.phHead} />
      <circle cx="49" cy="36" r="4" className={s.phInk} />
      <circle cx="71" cy="36" r="4" className={s.phInk} />
      <path d={mouth} fill="none" strokeWidth="3" strokeLinecap="round" className={s.phStroke} />
      <rect x="22" y="76" width="76" height="62" rx="16" className={s.phBody} />
      <rect x="34" y="138" width="20" height="32" rx="6" className={s.phLeg} />
      <rect x="66" y="138" width="20" height="32" rx="6" className={s.phLeg} />
    </svg>
  );
}
