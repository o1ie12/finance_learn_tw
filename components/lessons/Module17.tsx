import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#6C5B7B";

export default function Module17() {
  return (
    <>
      <Section title="打工賺的錢，跟你放棄的時間">
        <P>
          打工賺的每小時薪資，要跟「這段時間拿去讀書、準備實習、參加社團」的長期價值做比較。這就是
          <Term>機會成本</Term>——不是打工不好，而是要清楚知道自己在用時間換什麼。
        </P>
      </Section>

      <InfoBoard>
        <p>
          台灣基本工資逐年調整，大學生打工多以基本工資為底。試著算算自己的打工時薪與時數，換算成實際年收入，會更有感。
        </p>
      </InfoBoard>

      <Section title="大一大二，是打基礎的關鍵時期">
        <P>
          尤其是大一大二打好基礎的關鍵時期，為了多打工賺錢犧牲太多讀書或實習時間，長期來看，實習經驗跟成績對起薪的影響，可能遠大於打工存下的金額。
        </P>
        <MistakeNote>
          <p>
            只看眼前打工賺到的錢，沒有想過同樣的時間拿去準備實習或加強成績，長期可能帶來更大的回報。
          </p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          如果每週打工 15 小時能多賺 NT$4,500，但代價是沒有時間準備一份能提升未來起薪的實習申請，你會怎麼權衡？
        </p>
      </Scenario>
    </>
  );
}
