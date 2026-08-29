import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#C0392B";

export default function Module27() {
  return (
    <>
      <Section title="誰該修？先看是不是「人為造成」">
        <P>
          一般原則：非人為因素造成的正常損壞（像老舊管線漏水）通常由<Term>房東</Term>
          負責修繕，房客使用不當造成的損壞則由<Term>房客</Term>
          負責。簽約時可以在合約中明確約定修繕責任的分工，避免入住後有爭議。
        </P>
      </Section>

      <InfoBoard>
        <p>
          依民法出租人原則上負有修繕義務，但契約可另有約定，實際爭議常見於「這個損壞算誰的責任」的認定上。
        </p>
      </InfoBoard>

      <Section title="不敢反應，等於白白吃虧">
        <P>
          東西壞了不敢跟房東反應，自己默默花錢修，結果可能是房東本該負責的項目——先反應、先確認責任歸屬，再決定要不要自己出錢。
        </P>
        <MistakeNote>
          <p>東西壞了不確認責任歸屬，自己默默花錢修理，可能白白吃虧付了本該房東負擔的費用。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          入住三個月後，浴室水管開始漏水。這比較像是「正常老化」還是「使用不當」？你會怎麼跟房東說明狀況？
        </p>
      </Scenario>
    </>
  );
}
