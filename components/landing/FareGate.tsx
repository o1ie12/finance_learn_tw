"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { Arrow, SectionTag } from "./bits";
import s from "./landing.module.css";

/** Two short beeps, like an EasyCard reader. Silent where audio is blocked. */
function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.16].forEach((at) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1320;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.11);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.12);
    });
  } catch {
    /* no audio: the reader still lights up */
  }
}

/**
 * FL05: drag the 學習卡 onto the reader (or press 直接感應), it beeps, and
 * 建立我的學習卡 leads to sign-up. The button is the keyboard and
 * switch-access path; the drag is a bonus, never the only way.
 */
export function FareGate() {
  const [through, setThrough] = useState(false);
  const [pos, setPos] = useState({ dx: 0, dy: 0, dragging: false });
  const start = useRef<{ x: number; y: number } | null>(null);
  const reader = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  function tapIn() {
    if (through) return;
    beep();
    const r = reader.current?.getBoundingClientRect();
    const c = card.current?.getBoundingClientRect();
    // the card comes to rest over the reader's screen
    const dx = r && c ? r.left + r.width / 2 - (c.left - pos.dx + c.width / 2) : 0;
    const dy = r && c ? r.top + 70 - (c.top - pos.dy + c.height / 2) : 0;
    setPos({ dx, dy, dragging: false });
    setThrough(true);
  }
  function down(e: PointerEvent<HTMLDivElement>) {
    if (through) return;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPos({ dx: 0, dy: 0, dragging: true });
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    setPos({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, dragging: true });
  }
  function up() {
    if (!start.current) return;
    start.current = null;
    const r = reader.current?.getBoundingClientRect();
    const c = card.current?.getBoundingClientRect();
    const over = r && c && c.right > r.left + 40 && c.left < r.right && c.bottom > r.top && c.top < r.bottom;
    if (over) tapIn();
    else setPos({ dx: 0, dy: 0, dragging: false });
  }

  return (
    <div className={`${s.glass} ${s.gate}`}>
      <div className={s.gateText}>
        <SectionTag code="FL05" color="var(--metro-yellow)">
          <h2 id="go-h" className={s.h2} aria-live="polite">
            {through ? "嗶！歡迎上車" : "刷卡上車"}
          </h2>
        </SectionTag>
        <p className={s.gateBody}>免費，沒有廣告，不收你的真實姓名、電話或金融帳號。拿一組代碼就能開始，換一台裝置也接得上。</p>
        {through ? (
          <Link href="/signup?tap=1" className={`${s.primary} ${s.rise}`}>
            建立我的學習卡
            <Arrow />
          </Link>
        ) : (
          <div className={s.gateAlt}>
            <span>把卡片拖到感應區</span>
            <button type="button" className={s.secondary} onClick={tapIn}>
              直接感應
            </button>
          </div>
        )}
      </div>
      <div className={s.gateArea}>
        {!through ? (
          <div className={s.hint} aria-hidden="true">
            <span className={s.hintText}>
              <b>滑動刷卡</b>
              <small>SWIPE TO BOARD</small>
            </span>
          </div>
        ) : null}
        <div ref={reader} className={`${s.reader} ${through ? s.readerOk : s.readerWait}`} aria-hidden="true">
          <div className={s.readerScreen}>{through ? "✓ 嗶！" : "感應區"}</div>
          <div className={s.readerLight} />
        </div>
        <div
          ref={card}
          className={s.card}
          data-dragging={pos.dragging || undefined}
          data-through={through || undefined}
          style={{ transform: `translate(${pos.dx}px, ${pos.dy}px) rotate(${pos.dragging ? -3 : through ? 0 : -9}deg)` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-hidden="true"
        >
          <span className={s.cardStripe} />
          <div className={s.cardBody}>
            <b>錢途 學習卡</b>
            <small>FINLINE · STUDENT</small>
          </div>
        </div>
      </div>
    </div>
  );
}
