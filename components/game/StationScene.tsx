/**
 * The lit metro platform behind every game-shell screen (01 §2.1).
 * Pure CSS, decorative, fixed behind content, never takes pointer events.
 * Layout (percent of viewport height): wall 0 to 60%, platform doors 30% to
 * 60% with the door header at 30%, floor 60% to 100%, 14px tactile strip at
 * 60%. Must be rendered inside `.game-shell`.
 */
export function StationScene() {
  return (
    <div className="g-scene" aria-hidden="true">
      <div className="g-scene-wall" />
      <div className="g-scene-tunnel" />
      <div className="g-scene-glass" />
      <div className="g-scene-door-header" />
      <div className="g-scene-shine" />
      <div className="g-scene-floor" />
      <div className="g-scene-edge" />
    </div>
  );
}
