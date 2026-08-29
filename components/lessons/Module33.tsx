import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#0e6b56";

export default function Module33() {
  return (
    <>
      <Section title="你可能已經有保險，只是不知道">
        <P>
          學校通常會統一投保<Term>學生團體保險</Term>
          ，保障範圍多為意外傷害醫療，保費相對便宜，但保障額度通常不高。了解自己學校團保的保障範圍，可以評估是否需要額外的個人保障。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>各校學生團保方案與保額不同，建議由學校教務處或總務處確認實際保單內容。</p>
      </Callout>

      <Callout label="⚠ 常見錯誤" color={C}>
        <p>完全不知道自己有學生團保，發生意外時沒去申請理賠，白白放棄了已經繳過保費的保障。</p>
      </Callout>

      <Scenario color={C}>
        <p>如果你在學校運動時扭傷腳需要就醫，你知道要去哪裡查、怎麼申請學生團保的理賠嗎？</p>
      </Scenario>
    </>
  );
}
