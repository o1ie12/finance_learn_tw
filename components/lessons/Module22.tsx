import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#2C3E50";

export default function Module22() {
  return (
    <>
      <Section title="子女通常列在父母的申報戶下">
        <P>
          未滿一定年齡或仍在就學的子女，通常會列在父母的報稅戶籍下一起申報（列為
          <Term>受扶養親屬</Term>
          ），而不是自己單獨報稅。這牽涉到誰申報「幼兒學前扣除額」「教育學費扣除額」等項目。
        </P>
      </Section>

      <InfoBoard>
        <p>
          扶養親屬認定與各項特別扣除額規定每年可能微調，發布前請查證財政部最新規定。家庭成員之間，需要先溝通好由誰申報比較划算。
        </p>
      </InfoBoard>

      <Section title="沒溝通好，容易出問題">
        <P>
          家庭成員各自申報，容易導致重複列報扶養親屬或漏報。建議每年報稅前，家人先溝通好由誰申報哪些項目。
        </P>
        <MistakeNote>
          <p>家人各自報稅、互不知情，結果同一個扶養親屬被重複列報，或該列報的漏掉了。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          你家有兩個念大學的小孩，爸媽的所得級距不同。如果由所得較高的一方申報扶養，跟由較低的一方申報，退稅或補稅結果可能有什麼不同？
        </p>
      </Scenario>
    </>
  );
}
