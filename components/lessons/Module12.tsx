import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#E8542A";

export default function Module12() {
  return (
    <>
      <Section title="養、殺、盤：三個階段">
        <P>
          在交友軟體或社群認識「對象」，對方溫柔體貼、聊了幾週建立感情，接著開始提到自己在做投資、想帶你一起賺錢。這種手法叫
          <Term>殺豬盤</Term>：
        </P>
        <P>
          <Term>養</Term>（培養感情）→ <Term>殺</Term>（誘導投資）→{" "}
          <Term>盤</Term>（出金困難）三階段，鎖定的正是渴望情感連結的年輕人。
        </P>
      </Section>

      <InfoBoard source="內政部警政署 165 打詐儀表板">
        <p>
          假交友（愛情）詐騙與假投資詐騙經常結合出現，受害者的情感信任會被用來降低戒心、進而被引導至假投資平台——這正是「殺豬盤」這個名稱的由來。
        </p>
      </InfoBoard>

      <Section title="「認識這麼久了」不是安全的理由">
        <P>
          很多受害者覺得「認識這麼久了，對方不可能騙我」。但詐騙集團會刻意花時間培養信任——時間長不代表關係真實，一旦提到投資、轉帳，就該提高警覺。
        </P>
        <MistakeNote>
          <p>用「認識多久」來判斷對方是否可信。真正該注意的訊號，是對方有沒有提到投資或要求轉帳。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          網路上認識一個月的「對象」，聊得很投緣，某天突然說「我最近在做一個穩賺的投資，想帶你一起」。這句話裡，哪個部分最該讓你提高警覺？
        </p>
      </Scenario>
    </>
  );
}
