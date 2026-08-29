import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#22303f";

export default function Module19() {
  return (
    <>
      <Section title="實領金額，為什麼跟合約寫的不一樣？">
        <P>
          薪資單上的實領金額跟合約寫的薪資不一樣，是因為每個月會先扣除<Term>勞保費</Term>、
          <Term>健保費</Term>、<Term>勞退提繳</Term>
          （部分由雇主負擔）、以及所得稅預扣。認識這幾項扣款，才看得懂自己的薪資單在講什麼。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          勞保、健保費用由雇主與員工依比例分攤，勞工退休金雇主提繳率不得低於 <Term>6%</Term>
          ，實際扣繳比例與級距每年可能調整——發布前請查證勞動部與衛福部最新公告比例。
        </p>
      </Callout>

      <Section title="被扣的錢，不是被公司拿走">
        <P>
          很多人只看實領金額，覺得「公司少給我錢」，不知道扣掉的部分其實是勞保、健保跟自己的退休金提撥，不是被公司拿走。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>把「勞退自提」跟「被扣的稅」搞混。自提部分是存進自己的退休金專戶，最終還是你的錢。</p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>
          如果合約寫月薪 NT$30,000，實領卻是 NT$28,600，這中間的差額主要跑去哪裡了？試著列出可能的三個扣款項目。
        </p>
      </Scenario>
    </>
  );
}
