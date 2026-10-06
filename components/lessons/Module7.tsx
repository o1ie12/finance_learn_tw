import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Worked,
  Scenario,
} from "@/components/lesson";
import { MicroCheck } from "@/components/MicroCheck";

const C = lineAccentForModule(7).color;

export default function Module7() {
  return (
    <>
      <Section title="信用卡不是免費的錢">
        <P>
          信用卡是<Term>銀行先幫你付錢</Term>
          ——你刷卡的當下，其實是銀行代墊了這筆款項。在
          <Term>繳款截止日</Term>前把當期帳單全額還清，這筆代墊完全不收利息，等於免費借用了一段時間的資金；但只要沒有全額還清，遊戲規則就完全不同了。
        </P>
      </Section>

      <Section title="循環利息：從入帳日就開始算">
        <P>
          只繳<Term>最低應繳金額</Term>
          ，剩下的部分不會「自動延期、沒事」，而是開始計算
          <Term>循環利息</Term>
          。沒繳的那部分，是從那筆消費的<Term>入帳日</Term>
          （銀行替你把錢付給店家、記到你帳上的那天，通常在刷卡後幾天內）就按日起算，不是從結帳日或繳款截止日之後才開始；這段利息會出現在下一期帳單上。反過來說，只要在繳款截止日前全額繳清，就完全不用付利息。
        </P>
        <Worked
          title="刷卡消費 NT$10,000，只繳最低應繳"
          accent={C}
          rows={[
            { label: "消費金額", value: "NT$10,000" },
            { label: "最低應繳（約 10%）", value: "NT$1,000" },
            { label: "剩餘未繳、開始計息", value: "NT$9,000", strong: true },
          ]}
          note="這 NT$9,000 從入帳日起按日計算循環利息，下一期帳單就會看到；拖越久付越多——這就是為什麼「先繳一點點」感覺輕鬆，實際上代價不小。"
        />
        <MistakeNote>
          <p>
            把<Term>分期付款</Term>跟<Term>循環利息</Term>
            當成同一件事。分期通常利率較低且<Term>固定</Term>
            ，循環利息是<Term>浮動累積</Term>
            的，沒繳清就一直算，兩者的風險完全不一樣。
          </p>
        </MistakeNote>
      </Section>

      <MicroCheck
        color={C}
        question="信用卡只繳最低應繳金額，剩下的部分會發生什麼事？"
        options={[
          "自動延到下期，沒有額外費用",
          "銀行會自動幫你補齊",
          "沒有影響",
          "沒繳的部分從入帳日起計算循環利息",
        ]}
        correctIndex={3}
        explain="沒繳清的部分，從那筆消費的入帳日起按日計息，不是從繳款截止日之後才開始；利息會列在下一期帳單。"
      />

      <MicroCheck
        color={C}
        question="分期付款跟循環利息的差別是？"
        options={[
          "分期通常利率較低且固定，循環利息浮動累積",
          "完全一樣",
          "分期比較貴",
          "循環利息比較安全",
        ]}
        correctIndex={0}
        explain="分期是固定利率、固定期數；循環利息沒繳清就一直浮動累積，風險完全不同。"
      />

      <Section title="高中生怎麼開始練習用卡？">
        <P>
          多數高中生還不能自己申辦正卡，但可以透過<Term>附卡</Term>
          在家長監督下練習用卡習慣。更重要的不是「有沒有卡」，而是養成
          <Term>消費前先想好怎麼還</Term>
          的習慣——這個習慣，比任何一張卡片本身都更值錢。
        </P>
        <InfoBoard stat="15%" source="金管會規定">
          <p>
            台灣信用卡循環利率法定上限為年利率 15%；調查顯示 18-25
            歲年輕族群中超過八成日常消費偏好使用<Term>簽帳金融卡</Term>
            而非信用卡，主因是能避免超出能力範圍的消費。
          </p>
        </InfoBoard>
      </Section>

      <MicroCheck
        color={C}
        question="高中生要開始建立信用，比較實際的做法是？"
        options={[
          "立刻辦正卡大量消費",
          "完全不碰任何金融工具",
          "透過附卡在家長監督下練習用卡，養成消費前想清楚的習慣",
          "跟同學借錢練習",
        ]}
        correctIndex={2}
        explain="重要的不是「有沒有卡」，是消費前先想好怎麼還的習慣。"
      />

      <Scenario color={C}>
        <p>
          如果這個月刷了 NT$8,000，只繳得出最低應繳，你覺得剩下的錢應該優先怎麼處理：盡快多繳一點把本金壓低，還是先維持最低應繳、把現金留著應急？兩種選擇各自的代價是什麼？
        </p>
      </Scenario>
    </>
  );
}
