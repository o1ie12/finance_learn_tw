import {
  Section,
  P,
  Term,
  Callout,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#6C5B7B";

export default function Module15() {
  return (
    <>
      <Section title="在學期間，利息通常不是你的問題">
        <P>
          就學貸款由政府提供利息補貼，在學期間的利息通常由政府負擔，畢業後才開始計算你自己要負擔的部分，並有一段
          <Term>緩衝期</Term>才開始分期攤還。
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
