import {
  Section,
  P,
  Term,
  Bullets,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";
import { MicroCheck } from "@/components/MicroCheck";

const C = "#1F8A4C";

export default function Module6() {
  return (
    <>
      <Section title="記帳，是為了花錢「之前」就知道">
        <P>
          記帳的目的不是為了知道錢花去哪——那是花完之後才有的答案。真正有用的記帳，是在花錢
          <Term>之前</Term>就知道自己還剩多少可以花。
        </P>
        <P>
          最簡單好上手的框架是<Term>50/30/20 法則</Term>：把收入分成三份，
          <Term>50% 必要支出</Term>（吃飯、通勤、學用品）、
          <Term>30% 想要支出</Term>（手搖、娛樂、社交）、
          <Term>20% 存款與還款</Term>
          。不用記到每一筆飲料錢，抓對這三大類的比例，就已經贏過大多數從沒想過分類的人。
        </P>
        <MistakeNote>
          <p>
            記帳記到厭世，通常是分類記得太細——三大類就夠了，不用連衛生紙都單獨列一項。
          </p>
        </MistakeNote>
      </Section>

      <MicroCheck
        color={C}
        question="50/30/20 法則中，20% 代表什麼？"
        options={["娛樂支出", "存款與還款", "稅金", "房租"]}
        correctIndex={1}
        explain="50% 必要支出、30% 想要支出、20% 存款與還款——不用記到每一筆飲料錢，抓對大類比例就贏過大多數人。"
      />

      <Section title="緊急預備金：專款專用的安全網">
        <P>
          <Term>緊急預備金</Term>{" "}
          是專款專用的錢，只在真正意外發生時動用——手機摔壞、臨時要繳的費用，而不是「這個月手頭緊就先動用」。原則上建議先存到
          <Term>3-6 個月基本開銷</Term>
          ，對還在讀書、開銷有限的高中生來說，可以先從「一個月零用錢的等值」開始，重點是先建立這個帳戶存在的習慣。
        </P>
        <MistakeNote>
          <p>
            緊急預備金跟投資帳戶混在一起，是另一個常見誤區。緊急預備金要能<Term>隨時領出來</Term>
            ，放進會漲跌、或提領不便的投資帳戶，遇到真正需要用錢時反而動不了。
          </p>
        </MistakeNote>
      </Section>

      <MicroCheck
        color={C}
        question="緊急預備金應該放在哪裡比較合適？"
        options={[
          "投資帳戶，順便賺利息",
          "隨時可以領出來、跟日常花費分開的帳戶",
          "借給朋友周轉",
          "放在家裡現金",
        ]}
        correctIndex={1}
        explain="緊急預備金要能隨時領出來，放進會漲跌或提領不便的投資帳戶，真正需要用錢時反而動不了。"
      />

      <Section title="先存錢，再花錢">
        <P>
          「先存錢再花錢」比「花剩的再存」成功率高很多，差別在於<Term>順序</Term>
          。發零用錢或打工薪水的當天，先把要存的那一份轉走，剩下的才是可以自由花用的錢——這樣存錢就不用每次都靠意志力，而是變成一個自動發生的預設動作。
        </P>
        <InfoBoard>
          <p>
            銀行提供的<Term>約定轉帳</Term>
            多數免手續費，適合未成年人在家長協助下設定，讓「先存錢」這件事自動化、不用每個月自己記得手動轉。
          </p>
        </InfoBoard>
      </Section>

      <MicroCheck
        color={C}
        question="「先存錢再花錢」比「花剩的再存」有效的原因是？"
        options={["金額比較多", "剩下的錢通常會被花光", "銀行規定", "沒有差別"]}
        correctIndex={1}
        explain="自動化把存錢變成不需要意志力的預設行為，剩下的錢通常會被花光。"
      />

      <Section title="幫目標裝上期限：SMART 原則">
        <P>
          存錢沒有具體目標很難堅持——「我要多存一點」這種目標，撐不過兩個星期。用
          <Term>SMART 原則</Term>設定會有效得多：
        </P>
        <Bullets
          items={[
            <>
              <Term>明確（Specific）</Term>：不是「多存一點」，是「存到一台耳機」。
            </>,
            <>
              <Term>可衡量（Measurable）</Term>：有具體金額，例如 NT$3,000。
            </>,
            <>
              <Term>有期限（Time-bound）</Term>：三個月內存到，而不是「有一天」。
            </>,
          ]}
        />
        <InfoBoard>
          <p>
            行為經濟學研究顯示，把存款目標<Term>視覺化</Term>
            （例如進度條、完成度百分比）可以顯著提高達成率——這也是為什麼你在
            起點的路網上，每一站、每一條線都會有一條看得到的進度。
          </p>
        </InfoBoard>
      </Section>

      <MicroCheck
        color={C}
        question="存款目標設定時，以下哪個做法比較有效？"
        options={[
          "「我要多存一點」",
          "明確金額與期限，例如「三個月存 3000 元」",
          "完全不設目標",
          "目標越大越好",
        ]}
        correctIndex={1}
        explain="SMART 原則讓目標可衡量、有期限，比模糊目標容易堅持。"
      />

      <Scenario color={C}>
        <p>
          想一個你最近想買、但還沒買的東西。用 SMART 原則寫下：要存多少錢？打算幾個月內存到？打工或零用錢入帳的當天，你會先轉走多少比例？
        </p>
      </Scenario>
    </>
  );
}
