import { Section, P, Term, Bullets, Callout, Scenario } from "@/components/lesson";

const C = "#0e6b56";

export default function Module31() {
  return (
    <>
      <Section title="四種商業保險，各自解決不同的問題">
        <Bullets
          items={[
            <><Term>壽險</Term>：保障身故後家人的經濟保障。</>,
            <><Term>醫療險</Term>：給付住院醫療費用。</>,
            <><Term>意外險</Term>：保障意外事故導致的傷殘或身故。</>,
            <><Term>實支實付</Term>：依實際自費醫療支出理賠。</>,
          ]}
        />
        <P>高中生階段最需要優先了解的是意外險跟醫療險的基本概念。</P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>生病住院、意外骨折、需要長期照護——這三種情境分別會用到不同的保險，適合先用簡單情境比較各自派上用場的時機。</p>
      </Callout>

      <Callout label="⚠ 常見錯誤" color={C}>
        <p>分不清楚「意外險」跟「醫療險」理賠的情況不同，買了意外險以為生病住院也會賠，結果不符合理賠條件。</p>
      </Callout>

      <Scenario color={C}>
        <p>如果你這個學期打球時意外骨折，需要住院治療，這比較接近意外險理賠的情況，還是醫療險的情況？</p>
      </Scenario>
    </>
  );
}
