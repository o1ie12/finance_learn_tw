import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#C0392B";

export default function Module26() {
  return (
    <>
      <Section title="「申報就漲租金」，房東不能這樣要求">
        <P>
          部分房東要求租客不能申報租金支出扣除額，理由是「申報我要多繳稅，所以要漲租金」。但租客依法有權利申報
          <Term>租金支出特別扣除額</Term>，這是租客自己的稅務權益，不是房東可以片面禁止的。
        </P>
      </Section>

      <InfoBoard>
        <p>
          房屋租金支出已從列舉扣除額改為特別扣除額，上限金額由財政部公告，發布前請查證最新扣除額上限金額。
        </p>
      </InfoBoard>

      <Section title="怕衝突而放棄權益，不划算">
        <P>
          因為怕跟房東起衝突就放棄申報租金扣除額，等於白白放棄自己合法的節稅權益。這是很多租客實際遇到、卻選擇沉默的狀況。
        </P>
        <MistakeNote>
          <p>因為房東的口頭威脅就放棄合法權益。可以先了解自己的權利，再決定怎麼跟房東溝通。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          房東在簽約時口頭要求你「不能申報租金」，你會怎麼回應？如果你選擇還是申報了，該注意保留哪些證明文件？
        </p>
      </Scenario>
    </>
  );
}
