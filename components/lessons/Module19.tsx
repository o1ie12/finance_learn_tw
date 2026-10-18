import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(19).color;

export default function Module19() {
  return (
    <>
      <Section title="實領金額，為什麼跟合約寫的不一樣？">
        <P>
          薪資單上的實領金額跟合約寫的薪資不一樣，是因為每個月會先扣除<Term>勞保費</Term>、
          <Term>健保費</Term>。如果你選擇<Term>勞退自提</Term>
          ，也會一起扣。薪水比較高的人，還會被預扣所得稅。認識這幾項扣款，才看得懂自己的薪資單在講什麼。
        </P>
      </Section>

      <InfoBoard stat="6%" source="勞工退休金條例第 14 條；勞動部">
        <p>
          勞保、健保費用由雇主與員工依比例分攤，勞工退休金雇主提繳率不得低於
          6%，是雇主的法定義務。這筆錢由雇主全額負擔，不能從你的薪水扣。你也可以在工資 6% 以內自願提繳，叫做勞退自提，這部分才會從薪水扣。
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
