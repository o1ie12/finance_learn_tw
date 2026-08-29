import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#0e6b56";

export default function Module30() {
  return (
    <>
      <Section title="三種制度，三種性質">
        <P>
          <Term>勞保</Term>
          是在職期間的社會保險，包含生育、傷病、失能、老年、死亡等給付；
          <Term>勞退</Term>
          是雇主每月提撥的退休金專戶，屬於個人所有；
          <Term>職業災害保險</Term>
          則專門保障因工作造成的傷病。三者性質不同，不能互相取代。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>勞工職業災害保險自 111 年 5 月起與勞保整合施行，雇主應為所有員工投保，適用範圍以最新規定為準。</p>
      </Callout>

      <Section title="勞保不是退休金">
        <P>
          最容易搞混的一點：勞保聽起來很像退休金，但它其實是保險性質，理賠特定事件（生育、傷病、失能、死亡、老年給付）；真正屬於「你自己的錢」的退休金專戶，是勞退。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>把勞保當成「退休金」，其實勞退才是退休金專戶，勞保是保險性質，兩者分開計算跟請領。</p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>你的第一份薪資單上會同時出現勞保費跟勞退提繳，你能分清楚這兩筆扣款分別是在幫你存什麼嗎？</p>
      </Scenario>
    </>
  );
}
