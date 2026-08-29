import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#22303f";

export default function Module23() {
  return (
    <>
      <Section title="健保費之外，還有一筆「補充保費」">
        <P>
          除了每月固定的健保費，某些額外所得（像是超過一定金額的獎金、租金收入、股利）會被額外扣「
          <Term>二代健保補充保費</Term>
          」。這個對高中生現階段影響不大，但未來有兼職、投資收入時會用到。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          二代健保補充保費費率與課徵項目由衛福部公告，發布前請查證最新費率。現在先知道有這個概念，未來遇到就不會意外。
        </p>
      </Callout>

      <Section title="別跟「一般健保費」搞混">
        <P>
          很多人混淆「一般健保費」跟「二代健保補充保費」是同一件事，但兩者計算方式跟課徵對象不同——一般健保費是每月固定從薪資扣，補充保費則是針對特定額外所得。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>以為繳了一般健保費，就不會再有其他健保相關的扣款。額外所得達一定金額時，補充保費是另外課的。</p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>
          如果你未來投資股票，年底領到一筆股利，這筆股利除了可能影響所得稅，還會牽涉到哪個保費項目？
        </p>
      </Scenario>
    </>
  );
}
