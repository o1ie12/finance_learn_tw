import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#E8542A";

export default function Module9() {
  return (
    <>
      <Section title="起點通常是一個「看起來很正常」的群組">
        <P>
          最常見的詐騙起點，是被拉進一個 LINE 投資群組。裡面有一位「老師」每天報明牌、曬獲利截圖，群組裡其他人「跟單」都在賺錢——但那些帳號，很可能是同夥安排的。
        </P>
        <P>
          等你真的投入資金，一開始會讓你小賺、順利出金，藉此取信於你。等投入金額變大後，就會開始用各種理由卡住出金：系統維護、帳戶異常、要先繳一筆「解凍金」。
        </P>
      </Section>

      <InfoBoard>
        <p>
          2025 年全年台灣詐騙財損金額逼近新台幣 <Term>900 億元</Term>
          ，其中「假投資詐騙」是財損金額最高的類型——來源：內政部警政署 165 打詐儀表板、2025 全民反詐騙大調查。
        </p>
      </InfoBoard>

      <Section title="光是「看看群組」，也不安全">
        <P>
          很多人覺得「我只是看看群組，又沒有真的投錢」很安全。但光是留在群組裡，就會持續被洗腦式訊息影響判斷力——每天看到「又有人賺了」的截圖，會慢慢降低你的戒心。
        </P>
        <MistakeNote>
          <p>覺得「我只是看看，沒差」很安全。發現不對勁，最好的做法是直接退出群組，而不是繼續觀察。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          如果一個群組裡「老師」每天貼出獲利截圖，還有十幾個人留言說「跟著老師賺翻了」，你會用什麼方法判斷這是不是真的？
        </p>
      </Scenario>
    </>
  );
}
