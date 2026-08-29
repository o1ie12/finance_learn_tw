import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#D68910";

export default function Module38() {
  return (
    <>
      <Section title="合法經營，不是「賺大錢才需要處理」的事">
        <P>
          在台灣營利，達到一定規模需要辦理<Term>商業登記</Term>，並依規定開立統一發票或收據。這是合法經營的基本義務，提早了解能避免之後的麻煩。
        </P>
      </Section>

      <InfoBoard>
        <p>商業登記門檻與統一發票開立規定依營業額與行業別有不同規定，由財政部與經濟部公告。</p>
      </InfoBoard>

      <MistakeNote>
        <p>覺得「學生創業、小規模擺攤不用管這些」。規模擴大後補辦登記反而更麻煩，提早了解規則比較安全。</p>
      </MistakeNote>

      <Scenario color={C}>
        <p>如果你的攤位生意越做越大，開始固定在同一個地點每週擺攤，你覺得從什麼時候開始該認真考慮登記這件事？</p>
      </Scenario>
    </>
  );
}
