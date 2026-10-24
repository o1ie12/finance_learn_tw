/**
 * Finline Shorts (06 F3.10): one step from an existing task, no brief, about
 * 3 minutes, on 今天 as 「3 分鐘版」 for days with no time. Each Short points
 * at a step in the content, so the question, its scoring and its model
 * answer are that task's own (lib/tasks/registry.ts shortLesson). Only steps
 * that stand alone (no document to read) are listed.
 */
export interface ShortRef {
  /** The Short's own id: 「short.<taskSetId>.<stepId>」. */
  id: string;
  from: string;
  step: string;
  title: string;
}

const ref = (from: string, step: string, title: string): ShortRef => ({ id: `short.${from}.${step}`, from, step, title });

export const SHORTS: ShortRef[] = [
  ref("cunqian.goal.v1", "s4", "存款保險保障多少"),
  ref("xinyong.payoff.v1", "s2", "還不出來，先做什麼"),
  ref("baoxian.scooter.v1", "s2", "強制險賠誰"),
  ref("cunqian.compound.v1", "s3", "卡債幾年翻倍"),
  ref("xinyong.borrow.v1", "s3", "借錢實拿多少"),
];
