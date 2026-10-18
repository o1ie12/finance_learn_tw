import type { SnapshotData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KV, KVList, type DocumentProps } from "./fields";

/**
 * A small card about one person's money at a glance.
 *
 * Field ids: row:<i>
 */
export default function Snapshot({
  data,
  find,
  highlight,
  headingLevel,
}: { data: SnapshotData } & DocumentProps) {
  return (
    <DocumentFrame title={data.name} headingLevel={headingLevel}>
      <KVList find={find} label={data.name}>
        {data.rows.map((r, i) => (
          <KV key={i} id={`row:${i}`} label={r.label} value={r.value} find={find} highlight={highlight} />
        ))}
      </KVList>
    </DocumentFrame>
  );
}
