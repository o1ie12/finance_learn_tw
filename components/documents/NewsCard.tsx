import type { NewsCardData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import type { DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * A news clip from a generic outlet (no real outlet), always tagged 示意.
 * No field ids: news cards are read, not searched.
 */
export default function NewsCard({ data, headingLevel }: { data: NewsCardData } & DocumentProps) {
  return (
    <DocumentFrame title="財經新聞" sample headingLevel={headingLevel}>
      <article>
        <p className={s.dateLine}>{data.dateLabel}</p>
        <p className={s.headline}>{data.headline}</p>
        <p className={s.newsBody}>{data.body}</p>
      </article>
    </DocumentFrame>
  );
}
