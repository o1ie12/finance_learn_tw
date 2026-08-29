import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#2C3E50";

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

      <InfoBoard stat="6%" source="勞動部規定">
        <p>
          勞保、健保費用由雇主與員工依比例分攤，勞工退休金雇主提繳率不得低於
          6%，是雇主的法定義務。
        </p>
      </InfoBoard>

      <Section title="被扣的錢，不是被公司拿走">
        <P>
          很多人只看實領金額，覺得「公司少給我錢」，不知道扣掉的部分其實是勞保、健保跟自己的退休金提撥，不是被公司拿走。
        </P>
        <MistakeNote>
          <p>把「勞退自提」跟「被扣的稅」搞混。自提部分是存進自己的退休金專戶，最終還是你的錢。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          如果合約寫月薪 NT$30,000，實領卻是 NT$28,600，這中間的差額主要跑去哪裡了？試著列出可能的三個扣款項目。
        </p>
      </Scenario>
    </>
  );
}
