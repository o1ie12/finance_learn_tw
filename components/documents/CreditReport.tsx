import type { CreditReportData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KV, KVList, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 信用報告: a generic credit bureau summary (no real bureau, no logo). The
 * score is labelled 「信用評分（示意）」 (04 §4 Task B): the range of the
 * real bureau's score is not claimed here.
 *
 * Field ids: name, age, job, income, tenure, cards.count, cards.utilization,
 * cards.late12, loans, inquiries3m, guarantor, derogatory, score, application
 */
export default function CreditReport({
  data,
  find,
  highlight,
  headingLevel,
}: { data: CreditReportData } & DocumentProps) {
  const f = { find, highlight };
  return (
    <DocumentFrame title="信用報告摘要" subtitle="申請人資料" sample headingLevel={headingLevel}>
      <div className={s.scoreRow}>
        <div className={s.scoreBox}>
          <KVList find={find} label="信用評分">
            <KV id="score" label="信用評分（示意）" value={data.score} {...f} />
          </KVList>
        </div>
        <div className={s.scoreBox}>
          <KVList find={find} label="這次申請">
            <KV id="application" label="申請" value={data.application} text {...f} />
          </KVList>
        </div>
      </div>

      <div className={s.twoCol}>
        <div className={s.section}>
          <p className={s.sectionLabel}>基本資料</p>
          <KVList find={find} label="基本資料">
            <KV id="name" label="姓名" value={data.name} text {...f} />
            <KV id="age" label="年齡" value={`${data.age} 歲`} {...f} />
            <KV id="job" label="職業" value={data.job} text {...f} />
            <KV id="income" label="月收入" value={data.income} text {...f} />
            <KV id="tenure" label="年資" value={data.tenure} text {...f} />
          </KVList>
        </div>

        <div className={s.section}>
          <p className={s.sectionLabel}>信用卡</p>
          <KVList find={find} label="信用卡">
            <KV id="cards.count" label="張數" value={data.cards.count} text {...f} />
            <KV id="cards.utilization" label="額度使用率" value={data.cards.utilization} text {...f} />
            <KV id="cards.late12" label="近 12 個月遲繳次數" value={data.cards.late12} text {...f} />
          </KVList>

          <p className={`${s.sectionLabel} ${s.gapTop}`}>借款與紀錄</p>
          <KVList find={find} label="借款與紀錄">
            <KV id="loans" label="貸款每月要還" value={data.loans} text {...f} />
            <KV id="inquiries3m" label="近 3 個月被查詢次數" value={data.inquiries3m} text {...f} />
            <KV id="guarantor" label="擔任保證人" value={data.guarantor} text {...f} />
            <KV id="derogatory" label="強制停卡或呆帳紀錄" value={data.derogatory} text {...f} />
          </KVList>
        </div>
      </div>
    </DocumentFrame>
  );
}
