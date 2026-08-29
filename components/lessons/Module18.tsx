import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#6C5B7B";

export default function Module18() {
  return (
    <>
      <Section title="免費的錢，很多人沒去拿">
        <P>
          多數大學都有多種獎助學金管道：<Term>入學獎學金</Term>、<Term>系所獎學金</Term>、
          <Term>清寒助學金</Term>、<Term>緊急紓困金</Term>
          ，很多學生因為不知道或覺得麻煩而沒有申請，等於白白放棄免費的錢。
        </P>
      </Section>

      <InfoBoard>
        <p>
          常見獎助學金類型與申請時間軸（開學前、期中、期末各有不同申請窗口），具體管道依各校資源中心公告為準——開學後花 10 分鐘查一次校內公告，很值得。
        </p>
      </InfoBoard>

      <Section title="不是只有第一名才能拿">
        <P>
          很多人覺得獎學金只給「成績最頂尖」的人。但很多助學金是看家庭經濟狀況或特定條件申請，不是只有第一名才能拿。
        </P>
        <MistakeNote>
          <p>覺得自己「成績不夠好」就不申請。獎助學金的種類很多，條件也各不相同，不去查就永遠不知道自己符不符合。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          開學後，你會怎麼開始找自己學校有哪些獎助學金資源？想想看第一步該去哪裡查、問誰。
        </p>
      </Scenario>
    </>
  );
}
