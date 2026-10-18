import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Bullets,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(24).color;

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

      <InfoBoard>
        <p>
          透過房仲承租，房仲可以向房東、房客一方或雙方收費。內政部規定，雙方合計最多不能超過一個半月的租金。這是上限，不是固定價格，可以議價。房仲要先把收費標準和雙方比例寫在契約書上。
        </p>
      </InfoBoard>

      <MistakeNote>
        <p>
          只看照片跟白天看房就決定，沒有晚上再去看一次確認噪音跟治安，也沒實際測試水壓網路。
        </p>
      </MistakeNote>

      <Scenario color={C}>
        <p>
          白天看房時一切都很安靜，你會怎麼確認晚上這裡的實際狀況？除了自己晚上再去一趟，還有什麼方法可以打聽？
        </p>
      </Scenario>
    </>
  );
}
