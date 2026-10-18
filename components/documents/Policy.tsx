import type { PolicyData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KV, KVList, KeyTag, Mark, cx, isHl, isOn, type DocumentProps, type FindMode } from "./fields";
import s from "./documents.module.css";

/**
 * 保單摘要. The insurer is fictional.
 *
 * Field ids: insurer, type, premium, term, coverage:<i>, exclusions:<i>
 */

function ItemList({
  prefix,
  label,
  items,
  find,
  highlight,
}: {
  prefix: "coverage" | "exclusions";
  label: string;
  items: string[];
  find?: FindMode;
  highlight?: readonly string[];
}) {
  return (
    <div className={s.section}>
      <p className={s.sectionLabel}>{label}</p>
      <ul className={s.list} aria-label={label}>
        {items.map((text, i) => {
          const id = `${prefix}:${i}`;
          const hl = isHl(highlight, id);
          return (
            <li key={id} data-field={id}>
              {find ? (
                <button
                  type="button"
                  aria-pressed={isOn(find, id)}
                  disabled={find.disabled}
                  onClick={() => find.onToggle(id)}
                  className={cx(s.pick, hl && s.hl)}
                >
                  <span className={s.kvInner}>
                    <span>
                      {text}
                      {hl && <KeyTag />}
                    </span>
                  </span>
                  <Mark />
                </button>
              ) : (
                <span className={cx(s.listItem, hl && s.hl)}>
                  <span className={s.bullet} aria-hidden="true" />
                  <span>
                    {text}
                    {hl && <KeyTag />}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Policy({
  data,
  find,
  highlight,
  headingLevel,
}: { data: PolicyData } & DocumentProps) {
  const f = { find, highlight };
  return (
    <DocumentFrame title="保單摘要" headingLevel={headingLevel}>
      <KVList find={find} label="保單資料">
        <KV id="insurer" label="保險公司" value={data.insurer} text {...f} />
        <KV id="type" label="險種" value={data.type} text {...f} />
        <KV id="premium" label="保費" value={data.premium} {...f} />
        <KV id="term" label="繳費年期" value={data.term} text {...f} />
      </KVList>
      <ItemList prefix="coverage" label="保障內容" items={data.coverage} {...f} />
      <ItemList prefix="exclusions" label="除外責任（不賠的情況）" items={data.exclusions} {...f} />
    </DocumentFrame>
  );
}
