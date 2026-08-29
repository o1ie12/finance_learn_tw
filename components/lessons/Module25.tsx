import { Section, P, Term, Callout, Scenario } from "@/components/lesson";

const C = "#7a3d20";

export default function Module25() {
  return (
    <>
      <Section title="房東房客的權利義務，有官方範本可以比對">
        <P>
          內政部有公告「<Term>住宅租賃定型化契約應記載及不得記載事項</Term>」，像是「押金不得超過 2
          個月租金」「房客不得預先拋棄終止租約的權利」這類保障房客的條款，就算合約上寫了相反內容，那部分條款依法無效。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          內政部住宅租賃定型化契約範本明確規範押金上限與雙方權利義務，租屋前建議先比對房東提供的合約與官方範本是否有出入——來源：內政部不動產資訊平台。
        </p>
      </Callout>

      <Section title="簽了名，不代表條款一定有效">
        <P>
          很多人覺得「合約都簽了，寫什麼就是什麼」。但牴觸法定應記載/不得記載事項的條款，即使簽名了也不當然有效，可以主張依法認定。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>
            以為合約上寫的內容都必須遵守。牴觸法定規定的部分，即使簽了名也可以主張無效。
          </p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>
          簽約前，你會怎麼比對房東提供的合約跟內政部官方範本？如果發現有出入，你會怎麼跟房東溝通？
        </p>
      </Scenario>
    </>
  );
}
