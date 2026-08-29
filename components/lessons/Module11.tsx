import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#b8391a";

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

      <Callout label="台灣現況" color={C}>
        <p>
          網路購物詐騙是台灣詐騙受理案件數最多的類型，假客服解除分期是其中最常見的手法之一——來源：內政部警政署 165 打詐儀表板。
        </p>
      </Callout>

      <Section title="對方講得出你的訂單細節，不代表他是真客服">
        <P>
          很多人因為對方講得出訂單細節、姓名、電話就相信是真客服。但個資外流很普遍，對方知道你的訂單資訊，不代表他是真的客服。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>因為對方講得出個人資訊就信任對方。個資能被知道的管道很多，不是「他知道」就等於「他是真的」。</p>
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
