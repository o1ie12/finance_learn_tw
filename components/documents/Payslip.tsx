import { formatNT } from "@/components/Money";
import { payslipFor } from "@/lib/lifeGame/payroll";
import type { PayslipData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KV, KVList, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 薪資單. Deductions come from payslipFor (lib/lifeGame/payroll.ts, the
 * verified 115年度 constants in TAX_YEAR.payroll), never from content.
 *
 * `gross` is the monthly salary (本薪). 勞保/健保/勞退 are computed on it;
 * 加班費 is added to 應發 and to 實發 without changing the insured amounts
 * (the game does not model brackets). With no overtime, 實發 equals
 * netPay(gross), the figure content answers use.
 *
 * Field ids: company, month, base, overtime, gross, labor, health, pension, net
 */
export default function Payslip({
  data,
  find,
  highlight,
  headingLevel,
}: { data: PayslipData } & DocumentProps) {
  const p = payslipFor(data.gross, data.pensionRate ?? 0);
  const overtime = data.overtime ?? 0;
  const total = data.gross + overtime;
  const net = total - p.labor - p.health - p.pensionSelf;
  const pensionPct = Math.round((data.pensionRate ?? 0) * 100);
  const f = { find, highlight };

  return (
    <DocumentFrame title="薪資單" headingLevel={headingLevel}>
      <KVList find={find} label="薪資單資料" className={s.payHead}>
        <KV id="company" label="公司" value={data.company} text {...f} />
        <KV id="month" label="月份" value={data.month} {...f} />
      </KVList>

      <div className={s.twoCol}>
        <div className={s.section}>
          <p className={s.sectionLabel}>應發項目</p>
          <KVList find={find} label="應發項目">
            <KV id="base" label="本薪" value={formatNT(data.gross)} {...f} />
            <KV id="overtime" label="加班費" value={formatNT(overtime)} {...f} />
            <KV id="gross" label="應發合計" value={formatNT(total)} {...f} />
          </KVList>
        </div>
        <div className={s.section}>
          <p className={s.sectionLabel}>應扣項目</p>
          <KVList find={find} label="應扣項目">
            <KV id="labor" label="勞保自付" value={formatNT(p.labor)} {...f} />
            <KV id="health" label="健保自付" value={formatNT(p.health)} {...f} />
            <KV
              id="pension"
              label={`勞退自提（${pensionPct}%）`}
              value={formatNT(p.pensionSelf)}
              {...f}
            />
          </KVList>
        </div>
      </div>

      <div className={s.netBox}>
        <KVList find={find} label="實發">
          <KV id="net" label="實發金額" value={formatNT(net)} big {...f} />
        </KVList>
      </div>
    </DocumentFrame>
  );
}
