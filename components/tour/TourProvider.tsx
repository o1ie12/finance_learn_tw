"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import TourOverlay from "@/components/tour/TourOverlay";
import {
  CURRENT_TUTORIAL_VERSION,
  TOUR_STEPS,
  type TourStep,
  type TourVariant,
} from "@/lib/tour";

/**
 * Owns whether the tour is running, and which step it is on.
 *
 * Mounted once in the root layout rather than on the two destinations,
 * because the help control lives in the site header and the header is on
 * every page. Keeping the engine next to the header means the control can
 * open the tour from anywhere without either of them knowing about the
 * destination pages.
 *
 * The step list is resolved against the DOM at the moment the tour starts,
 * not at module load: a step whose target is not rendered in the current
 * variant is dropped then and there, so it can never become a popover
 * anchored to nothing or a Next button that appears to do nothing.
 */

const DESTINATION: Record<TourVariant, string> = {
  learn: "/dashboard",
  simulate: "/simulate",
};

// Mirrors lib/session.ts MODE_COOKIE, the same non-httpOnly marker the header
// and the mode toggle read.
const MODE_COOKIE = "fs_mode";

function variantForPath(pathname: string): TourVariant | null {
  if (pathname.startsWith("/simulate")) return "simulate";
  if (pathname.startsWith("/dashboard")) return "learn";
  return null;
}

function storedDestination(): string {
  if (typeof document === "undefined") return DESTINATION.simulate;
  const hit = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${MODE_COOKIE}=`));
  const mode = hit?.slice(MODE_COOKIE.length + 1);
  return mode === "full" ? DESTINATION.learn : DESTINATION.simulate;
}

interface TourApi {
  /** Replay from the beginning, from anywhere in the app. */
  start: () => void;
  /** First-run entry: starts only if this student has not seen this version. */
  autoStart: (seenVersion: number | undefined) => void;
  active: boolean;
}

const TourContext = createContext<TourApi | null>(null);

export function useTour(): TourApi {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used inside <TourProvider>");
  }
  return ctx;
}

export default function TourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  // Auto-start is once per page session. Without this, every re-render that
  // reached autoStart would reopen a tour the student had just skipped,
  // because the profile write has not come back yet.
  const autoStarted = useRef(false);

  const variant = variantForPath(pathname);

  /**
   * Resolve the step list against the DOM, giving it a moment to settle.
   *
   * A single synchronous query is wrong, and quietly so. Parts of the header
   * are client-only — the help control renders nothing until an effect has
   * read the session cookie — so at the instant a first-run tour starts, its
   * last step's target genuinely is not in the document yet. Resolving then
   * drops the one step that tells a student how to reopen the tour, and
   * nothing about the result looks broken: the tour just runs four steps
   * instead of five.
   *
   * So: resolve as soon as every target is found, and give up after a short
   * bounded wait for the ones that are legitimately absent in this variant.
   *
   * Polled on a timer rather than requestAnimationFrame. What is being
   * waited on is React committing a render, not the browser painting one,
   * and the two come apart exactly where it matters: rAF callbacks do not
   * fire at all in a hidden or backgrounded tab, so a tour opened in one
   * would sit unresolved instead of being ready the moment the student looks
   * at it. The overlay's own rect tracking does use rAF, because that really
   * is about painting.
   */
  const begin = useCallback(() => {
    const STEP_MS = 16;
    const MAX_TRIES = 20; // ~320ms, imperceptible before a tour opens
    let tries = 0;
    const resolve = () => {
      const present = TOUR_STEPS.filter((s) =>
        document.querySelector(`[data-tour-id="${s.target}"]`),
      );
      if (present.length === TOUR_STEPS.length || tries >= MAX_TRIES) {
        if (present.length === 0) return;
        setSteps(present);
        setIndex(0);
        return;
      }
      tries += 1;
      window.setTimeout(resolve, STEP_MS);
    };
    resolve();
  }, []);

  const start = useCallback(() => {
    if (variant) {
      begin();
      return;
    }
    // Off a destination there is almost nothing for the tour to point at, so
    // take the student to their own destination and start there rather than
    // running a hollow two-step version of it wherever they happen to be.
    router.push(`${storedDestination()}?tour=1`);
  }, [variant, begin, router]);

  const markSeen = useCallback(() => {
    // Fire and forget: nothing on screen waits for it, and a failed write
    // only means the tour offers itself once more next time.
    void fetch("/api/tour", { method: "POST" }).catch(() => undefined);
  }, []);

  const autoStart = useCallback(
    (seenVersion: number | undefined) => {
      if (autoStarted.current) return;
      if ((seenVersion ?? 0) >= CURRENT_TUTORIAL_VERSION) return;
      autoStarted.current = true;
      begin();
    },
    [begin],
  );

  const close = useCallback(() => {
    setSteps(null);
    setIndex(0);
    autoStarted.current = true;
    markSeen();
  }, [markSeen]);

  // Advancing past the last step ends the tour. Deliberately NOT expressed
  // inside a setIndex updater: an updater has to be a pure function of the
  // previous state, and React is free to call it twice, so closing from in
  // there ran the finish path unpredictably — the overlay stayed on screen
  // after 開始使用 and the seen-flag was never written.
  const advance = useCallback(() => {
    if (!steps) return;
    if (index >= steps.length - 1) {
      // Finishing and skipping are the same outcome; close() records it.
      close();
      return;
    }
    setIndex(index + 1);
  }, [steps, index, close]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const api = useMemo<TourApi>(
    () => ({ start, autoStart, active: steps !== null }),
    [start, autoStart, steps],
  );

  return (
    <TourContext.Provider value={api}>
      {children}
      {steps && variant && (
        <TourOverlay
          steps={steps}
          index={Math.min(index, steps.length - 1)}
          variant={variant}
          onNext={advance}
          onBack={back}
          onSkip={close}
          // A target that vanishes mid-tour (a rerender dropped it, the
          // student navigated) should not strand the overlay on nothing.
          onTargetLost={advance}
        />
      )}
    </TourContext.Provider>
  );
}
