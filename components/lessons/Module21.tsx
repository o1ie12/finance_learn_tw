import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#2C3E50";

export default function Module21() {
  return (
    <>
      <Section title="打工滿一定金額，會收到這張憑證">
        <P>
          打工滿一定金額，雇主會開立<Term>扣繳憑單</Term>
          ，這是你當年度所得的正式證明。就算所得不多、不用繳稅，扣繳憑單也該留著——報稅、辦助學貸款、申請補助時都可能用到。
        </P>
      </Section>

      <InfoBoard>
        <p>
          扣繳憑單上最該留意的欄位：所得類別、給付總額、扣繳稅額、給付單位統一編號。第一次拿到看不懂很正常，先確認姓名、身分證字號跟金額有沒有錯就好。
        </p>
      </InfoBoard>

      <Section title="收到憑單，先別急著丟">
        <P>
          很多人收到扣繳憑單隨手丟掉，覺得反正自己不用報稅。留存憑證是好習慣，很多申請文件會要求提供。
        </P>
        <MistakeNote>
          <p>覺得「不用繳稅就不用留」。之後申請助學貸款、獎學金、租屋補助時，可能都會需要提出所得證明。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          你今年打工賺了 NT$45,000，雇主寄來一張扣繳憑單。你會把它放在哪裡保存？明年報稅季前，你會怎麼提醒自己找出這張憑單？
        </p>
      </Scenario>
    </>
  );
}
