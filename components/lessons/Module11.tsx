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

const C = lineAccentForModule(11).color;

// Age-group ranking: 內政部警政署 警政統計通報 115年第14週 (2026-04-01):
// 未滿18歲及18-23歲被害人以「假網路拍賣(購物)」最多. Replaces an unsourced
// claim that 網購 was the most common type overall (it was 投資詐欺).

export default function Module11() {
  return (
    <>
      <Section title="「客服」打來說你訂閱了分期付款">
        <P>
          接到「電商客服」電話，說你不小心訂閱了分期付款方案，要幫你「解除分期」，接著引導你到 ATM
          或網銀操作一連串步驟——這些步驟的真正目的，其實是把你帳戶裡的錢轉出去，不是解除任何東西。
        </P>
        <Callout label="重點" color={C}>
          <p>
            真正的客服<Term>不會</Term>要求你去 ATM「解除」任何交易。任何要你操作 ATM 或網銀的「解除」流程，都該立刻掛斷。
          </p>
        </Callout>
      </Section>

      <InfoBoard source="內政部警政署 警政統計通報（2026 年 4 月）">
        <p>
          2025 年，未滿 18 歲和 18–23 歲的詐欺被害人，最常遇到的都是<Term>假網路拍賣（購物）</Term>
          詐騙。假客服「解除分期」就是從網購訂單衍生出來的手法。
        </p>
      </InfoBoard>

      <Section title="對方講得出你的訂單細節，不代表他是真客服">
        <P>
          很多人因為對方講得出訂單細節、姓名、電話就相信是真客服。但個資外流很普遍，對方知道你的訂單資訊，不代表他是真的客服。
        </P>
        <MistakeNote>
          <p>因為對方講得出個人資訊就信任對方。個資能被知道的管道很多，不是「他知道」就等於「他是真的」。</p>
        </MistakeNote>
      </Section>

      <Section title="另一種壓力：電話那頭是「警察」或「檢察官」">
        <P>
          <Term>假檢警</Term>
          （假冒公務員）是另一種經典手法：對方自稱警察、檢察官或法院人員，說你的帳戶涉及洗錢或刑案，要你「配合調查」、不准告訴家人，再要你把錢轉到「監管帳戶」或交出存摺、提款卡。它靠的不是貪心，是<Term>恐懼和急迫</Term>
          ——讓你沒時間想。
        </P>
        <Callout label="怎麼應對" color={C}>
          <p>
            不管對方怎麼說，先掛斷。自己查官方電話回撥確認，或直接打 165 問。真的有事，掛斷再打回去也不會因此變得更嚴重。
          </p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>
          接到電話說你在某購物網站「不小心訂閱分期付款」，要你打開網銀 App 操作。你會先做什麼來確認這通電話是真是假？
        </p>
      </Scenario>
    </>
  );
}
