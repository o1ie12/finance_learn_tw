import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(38).color;

export default function Module38() {
  return (
    <>
      <Section title="合法經營，不是「賺大錢才需要處理」的事">
        <P>
          在台灣營利，要分清楚兩種登記：<Term>商業登記</Term>和向國稅局辦的<Term>稅籍登記</Term>。商業登記法規定，攤販、每月銷售額沒到營業稅起徵點的小生意等，可以不辦商業登記。超過這些範圍，就要辦商業登記，並依規定開立統一發票或收據。
        </P>
        <P>
          可以不辦商業登記，不代表不用管稅。財政部規定，有固定地點的攤販，還是要設立稅籍。這是合法經營的基本義務，提早了解能避免之後的麻煩。
        </P>
      </Section>

      <InfoBoard>
        <p>商業登記門檻與統一發票開立規定依營業額與行業別有不同規定，由財政部與經濟部公告。</p>
      </InfoBoard>

      <MistakeNote>
        <p>覺得「學生擺攤，什麼登記都不用管」。攤販可以不辦商業登記，但固定攤位還是要設立稅籍。規模擴大後才補辦，反而更麻煩，提早了解規則比較安全。</p>
      </MistakeNote>

      <Scenario color={C}>
        <p>如果你的攤位生意越做越大，開始固定在同一個地點每週擺攤，你覺得從什麼時候開始該認真考慮稅籍登記這件事？</p>
      </Scenario>
    </>
  );
}
