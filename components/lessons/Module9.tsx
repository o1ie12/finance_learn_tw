import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  Bullets,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(9).color;

/*
 * Sources, verified 2026-10-06:
 * - 2025 詐欺 197,595 件, 投資詐欺 29.69% 最多: 內政部警政署 警政統計通報
 *   115年第14週 (2026-04-01), npa.gov.tw doc 1488707994689474560.
 * - 證期局「證券期貨特許事業」 sfb.gov.tw/ch/home.jsp?id=1015 and
 *   「防範非法證券期貨業宣導專區」 sfb.gov.tw/ch/home.jsp?id=775.
 * - 注意/處置: 臺灣證券交易所 公布或通知注意交易資訊暨處置作業要點
 *   (twse-regulation FL007225, amended 2026-08); 處置 includes 預收款券.
 *   Matching intervals changed in 2026, so the copy names none.
 * - 165 反詐騙諮詢專線, 內政部警政署 (data.gov.tw dataset 78432).
 * - 證券期貨反詐騙諮詢專線 (02)2737-3434: 證期局 投資人申訴方式
 *   sfb.gov.tw/ch/home.jsp?id=1048.
 */

export default function Module9() {
  return (
    <>
      <Section title="起點通常是一個「看起來很正常」的群組">
        <P>
          很多人是從一則廣告開始的：臉書、YouTube 上，盜用名人照片的「投資教學」廣告，點進去就被拉進一個 LINE 投資群組。裡面有一位「老師」每天報明牌、曬獲利截圖，群組裡其他人「跟單」都在賺錢——但那些帳號，很可能是同夥安排的。
        </P>
        <P>
          接著對方會叫你下載某個投資 App 或網站（常包裝成股票、黃金或虛擬貨幣的交易平台），等你投入資金，一開始會讓你小賺、順利出金，藉此取信於你。等投入金額變大後，就會開始用各種理由卡住出金：系統維護、帳戶異常、要先繳一筆「解凍金」。
        </P>
        <P>
          前面那些「獲利」，其實常是拿後來的人投進去的錢，付給前面的人——這種手法有個名字，叫<Term>龐氏騙局</Term>
          。新的錢一停，整個就垮了，最後一批人血本無歸。
        </P>
      </Section>

      <InfoBoard stat="19.8 萬件" source="內政部警政署 警政統計通報（2026 年 4 月）">
        <p>
          2025 年台灣發生的詐欺案件約 19.8 萬件，其中最多的是<Term>投資詐欺</Term>
          ，約占三成（29.69%）。
        </p>
      </InfoBoard>

      <Section title="下單之前，先查三件事">
        <Bullets
          items={[
            <>
              <Term>這家公司合法嗎？</Term>
              金管會證期局網站有「證券期貨特許事業」名單，也有「防範非法證券期貨業宣導專區」。名單上找不到的「券商」或「投資平台」，就不要碰。
            </>,
            <>
              <Term>老師報的股票有沒有被盯上？</Term>
              臺灣證券交易所會把短期內價格或成交量異常的股票公布為<Term>注意股票</Term>
              ，情況更嚴重的列為<Term>處置股票</Term>
              ，交易會受到限制（例如要先付清款項才能買）。「飆股」正好在名單上，就是警訊。
            </>,
            <>
              <Term>覺得不對勁，打電話問。</Term>
              <Term>165</Term> 是內政部警政署的反詐騙諮詢專線，可以諮詢、檢舉可疑的訊息；跟證券、期貨投資有關的，也可以打
              <Term>證券期貨反詐騙諮詢專線（02）2737-3434</Term>。
            </>,
          ]}
        />
      </Section>

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
