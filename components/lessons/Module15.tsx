import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  Callout,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(15).color;

// 在學期間利息由主管機關全額負擔: 高級中等以上學校學生就學貸款辦法 §8,
// 115-06-10 修正條文自 115-08-01 施行 (§16). edu.law.moe.gov.tw FL008414,
// verified 2026-10-06.
export default function Module15() {
  return (
    <>
      <Section title="在學期間，利息通常不是你的問題">
        <P>
          依教育部的《高級中等以上學校學生就學貸款辦法》，從 2026 年 8 月（115 學年度）起，符合貸款資格的學生在學期間的利息，由政府<Term>全額負擔</Term>
          。開始還款以後，利息才由你負擔一部分，而且畢業後還有一段<Term>緩衝期</Term>才開始分期攤還。
        </P>
        <Callout label="重點" color={C}>
          <p>
            這代表就學貸款不是「現在不用管」，而是「現在不用還，但債務持續累積，畢業後會變成實際負擔」。
          </p>
        </Callout>
      </Section>

      <InfoBoard>
        <p>
          就學貸款細節（補貼利率、緩衝期長度、攤還年限）由教育部與承辦銀行公告，規定會隨政策調整——申請前務必查證教育部就學貸款最新規定，避免資訊過時誤導決定。
        </p>
      </InfoBoard>

      <Section title="畢業當年，就要開始面對還款規劃">
        <P>
          很多人把就學貸款當成「不用還的錢」。它是真實的<Term>債務</Term>
          ，只是延後負擔——畢業當年就要開始面對還款規劃，這是選擇貸款前該先想清楚的事。
        </P>
        <MistakeNote>
          <p>把就學貸款當成免費資金，沒有預先規劃畢業後的還款來源，等緩衝期一過才開始緊張。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          如果你貸款 40 萬元讀完大學，畢業後用 10 年攤還，平均每個月大約要還多少？這個數字，跟你預期的起薪比起來，負擔重不重？
        </p>
      </Scenario>
    </>
  );
}
