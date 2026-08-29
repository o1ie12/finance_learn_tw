import { Section, P, Term, Worked, Callout, Scenario } from "@/components/lesson";

const C = "#22303f";

export default function Module20() {
  return (
    <>
      <Section title="累進稅率：分段計算，不是全部套用高稅率">
        <P>
          綜合所得稅用<Term>累進稅率</Term>
          計算，所得越高適用稅率越高，但不是全部所得都用最高稅率算，是<Term>分段計算</Term>。
        </P>
        <P>
          <Term>免稅額</Term>跟<Term>標準扣除額</Term>
          是先從所得中扣除的固定金額，剩下的才是要繳稅的「所得淨額」。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          113 年度（2025 年申報）個人免稅額為新台幣 9.7 萬元，標準扣除額為 13.1 萬元，綜所稅分
          5%、12%、20%、30%、40% 五個級距——來源：財政部公告，發布前務必更新為最新申報年度數字。
        </p>
      </Callout>

      <Worked
        title="累進稅率的分段概念（示意）"
        accent={C}
        rows={[
          { label: "淨額 0 – 59 萬部分", value: "課 5%" },
          { label: "淨額 59 – 133 萬部分", value: "課 12%" },
          { label: "淨額 133 萬以上部分", value: "課 20% 起" },
        ]}
        note="每一段各自課自己的稅率，不是「淨額落在哪一級距，全部都用那個稅率算」。"
      />

      <Callout label="⚠ 常見錯誤" color={C}>
        <p>以為「所得超過某個級距，全部所得都用那個高稅率算」。累進稅率只有超過該級距的部分才適用較高稅率。</p>
      </Callout>

      <Scenario color={C}>
        <p>
          如果淨所得剛好卡在 12% 級距的邊界，跟卡在 5% 級距的邊界，實際多繳的稅差多少？想想「分段計算」跟「全部套用高稅率」算出來的結果，差距有多大。
        </p>
      </Scenario>
    </>
  );
}
