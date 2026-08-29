import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#8a5906";

export default function Module34() {
  return (
    <>
      <Section title="兩種成本，兩種行為模式">
        <P>
          <Term>固定成本</Term>
          不隨銷售量變化（店租、基本人事費），
          <Term>變動成本</Term>
          隨銷售量增減（原料、包材）。搞懂這兩種成本的差異，才能算出「賣多少才會開始賺錢」。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>適合搭配社團或校內活動實際擺攤的經驗做案例，比抽象定義更容易理解成本結構。</p>
      </Callout>

      <Section title="混在一起算，最容易出事">
        <P>不區分固定跟變動成本，很容易在銷量增加時忽略變動成本也跟著增加，誤以為「賣越多一定賺越多」。</P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>把所有支出混在一起算，不區分固定跟變動成本，導致「賣越多賠越多」都沒發現。</p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>如果你要擺一天攤位，店租（或攤位費）是固定成本，那珍珠、茶葉、杯子呢？試著把你能想到的成本分成兩類。</p>
      </Scenario>
    </>
  );
}
