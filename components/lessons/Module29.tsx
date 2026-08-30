import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#16A085";

export default function Module29() {
  return (
    <>
      <Section title="健保給付大部分基本醫療需求">
        <P>
          全民健保給付大部分基本醫療需求（門診、住院、手術），但不給付<Term>病房差額</Term>、特殊自費藥物或器材、健檢、美容醫療等項目。認識健保的給付範圍，才知道自己實際的保障缺口在哪裡。
        </P>
      </Section>

      <InfoBoard>
        <p>健保給付範圍與部分負擔金額由衛福部健保署公告，實際內容以最新規定為準。</p>
      </InfoBoard>

      <Section title="健保是基礎，不是全額給付">
        <P>
          健保是台灣人最基本的醫療安全網，但它解決的是「基本需求」，不是「所有需求」。遇到重大疾病或需要特殊器材時，自費項目經常是一筆不小的支出。
        </P>
        <MistakeNote>
          <p>以為「有健保就什麼都不用擔心」。健保是基礎保障，不是全額給付，自費項目在重大疾病或意外時可能是不小的負擔。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>如果家人住院需要用到健保不給付的自費藥物或病房，你會怎麼提前知道這筆費用大概多少？</p>
      </Scenario>
    </>
  );
}
