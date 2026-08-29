import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#D68910";

export default function Module37() {
  return (
    <>
      <Section title="有獲利，不代表有現金">
        <P>
          帳面上有<Term>獲利</Term>，不代表手上有<Term>現金</Term>
          可以用，例如客戶還沒付款、庫存還沒賣掉。很多小生意不是死於「不賺錢」，是死於「手上沒有現金支付當下該付的錢」，也就是現金流斷裂。
        </P>
      </Section>

      <InfoBoard>
        <p>典型時間差：進貨要先付錢 → 賣出商品 → 客戶延後付款。這段時間差就是現金流管理的核心。</p>
      </InfoBoard>

      <MistakeNote>
        <p>只看損益表覺得「這個月有賺錢」，沒注意到現金什麼時候真正進帳，結果周轉不靈。</p>
      </MistakeNote>

      <Scenario color={C}>
        <p>如果這個月帳面獲利 NT$5,000，但客戶的貨款要下個月才會到帳，這個月你要怎麼確保有現金支付原料錢？</p>
      </Scenario>
    </>
  );
}
