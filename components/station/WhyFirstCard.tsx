import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import type { LineMeta } from "@/lib/lines";
import type { Takeaway } from "@/lib/tasks/types";

/**
 * The why-first layer (04 §2) on pages that still run their original lesson
 * or simulation: the line's hook question, the trap it names, and the tool
 * to keep. One shared component (Stage I).
 */
export function WhyFirstCard({
  line,
  station,
  hook,
  bias,
  takeaway,
  reveal,
}: {
  line: Pick<LineMeta, "color" | "enName" | "name">;
  station?: string;
  hook: string;
  bias: string;
  takeaway: Takeaway;
  reveal?: string;
}) {
  return (
    <div className="g-whyfirst">
      {station ? <StationSign line={line} station={station} /> : null}
      <FloatCard strong title={`${line.name} · 先想一想`} as="section">
        <p className="g-whyfirst-q">{hook}</p>
        {reveal ? (
          <p className="g-whyfirst-reveal">
            這條線談的心理陷阱是「{bias}」：{reveal}
          </p>
        ) : (
          <p className="g-whyfirst-reveal">這條線談的心理陷阱是「{bias}」。</p>
        )}
        <p className="g-whyfirst-tool">
          <strong>{takeaway.name}</strong>
          {takeaway.lines.length ? `：${takeaway.lines.join("、")}` : ""}
        </p>
      </FloatCard>
    </div>
  );
}
