import { Section, P, Bullets, Callout, Scenario } from "@/components/lesson";

const C = "#7a3d20";

export default function Module24() {
  return (
    <>
      <Section title="看房時該檢查什麼">
        <P>看房時該檢查的重點：</P>
        <Bullets
          items={[
            <>水壓（開水龍頭實際感受一下）。</>,
            <>漏水痕跡（特別注意天花板角落）。</>,
            <>採光與噪音（白天晚上都該看一次）。</>,
            <>鄰近設施與網路訊號。</>,
          ]}
        />
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          透過房仲承租，房仲費通常由房東與房客共同負擔，行情約為半個月租金，實際比例可議價。
        </p>
      </Callout>

      <Callout label="⚠ 常見錯誤" color={C}>
        <p>
          只看照片跟白天看房就決定，沒有晚上再去看一次確認噪音跟治安，也沒實際測試水壓網路。
        </p>
      </Callout>

      <Scenario color={C}>
        <p>
          白天看房時一切都很安靜，你會怎麼確認晚上這裡的實際狀況？除了自己晚上再去一趟，還有什麼方法可以打聽？
        </p>
      </Scenario>
    </>
  );
}
