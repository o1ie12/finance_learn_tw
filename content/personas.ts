/**
 * Who sends each line's task messages (06 F3.1): one fictional person per
 * line. Every name, role and organisation here is invented (名稱皆為虛構);
 * the organisations reuse the fictional places of 06 E9.1.7.
 */
import type { LineSlug } from "@/lib/lines";

export interface Sender {
  name: string;
  role: string;
  org: string;
}

export const PERSONA: Record<LineSlug, Sender> = {
  zhiya: { name: "林雅琪", role: "人資專員", org: "晴空科技" },
  cunqian: { name: "王小姐", role: "理財專員", org: "晨光儲蓄所" },
  qixin: { name: "小安", role: "學姊", org: "星河大學" },
  xinyong: { name: "林經理", role: "放款主管", org: "星河銀行" },
  touzi: { name: "張分析師", role: "研究員", org: "穩健證券" },
  zhapian: { name: "陳警官", role: "反詐騙專員", org: "晴川分局" },
  xuedai: { name: "吳老師", role: "生輔組老師", org: "星河大學" },
  baoshui: { name: "許先生", role: "服務人員", org: "稅務服務台" },
  zuwu: { name: "黃阿姨", role: "房東", org: "晴川公寓" },
  baoxian: { name: "周專員", role: "保險業務員", org: "安心保險" },
  chuangye: { name: "阿傑", role: "小店老闆", org: "晨間小店" },
  caiwujuece: { name: "美玲", role: "理財顧問", org: "晨光儲蓄所" },
};
