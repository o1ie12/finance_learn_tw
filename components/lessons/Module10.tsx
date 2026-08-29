import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#E8542A";

export default function Module10() {
  return (
    <>
      <Section title="「借帳戶用一下」，代價是什麼？">
        <P>
          「借你的銀行帳戶用一下，幾天就給你三千元」聽起來像輕鬆賺錢。實際上，你的帳戶會被拿去接收詐騙贓款——你就是法律上的
          <Term>人頭帳戶</Term>。
        </P>
        <P>
          就算你不知情，一旦帳戶被列為<Term>警示帳戶</Term>
          ，你名下所有銀行帳戶都會被凍結，還可能背上<Term>洗錢防制法</Term>的刑事責任。
        </P>
      </Section>

      <InfoBoard>
        <p>
          依洗錢防制法規定，提供帳戶供他人犯罪使用可處刑責，且一旦成為警示帳戶當事人，將列入{" "}
          <Term>聯徵中心紀錄</Term>
          ，直接影響未來申辦銀行帳戶、信用卡、甚至部分工作的資格審查——來源：洗錢防制法相關規定，細節建議請教專業法律意見後定稿。
        </p>
      </InfoBoard>

      <Section title="「反正錢不是我拿的」不是理由">
        <P>
          很多人覺得「反正錢不是我拿的，頂多帳戶被停用而已」。但刑事責任跟信用紀錄的影響是長期的，可能影響到大學申請的部分審查項目與未來就業背景查核。
        </P>
        <MistakeNote>
          <p>低估「借帳戶」的後果。這不是「帳戶被停用」這麼簡單，是會跟著你很多年的紀錄。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          同學說「幫我一個忙，你的帳戶借我收一筆錢，事成之後給你三千元」。你會怎麼回應？除了拒絕，你還可以做什麼來保護自己？
        </p>
      </Scenario>
    </>
  );
}
