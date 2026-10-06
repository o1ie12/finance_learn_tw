import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  Bullets,
  Callout,
  MistakeNote,
  Worked,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(42).color;

/*
 * Vocabulary only. Every number on this station belongs to a made-up company
 * (晴光電子) and is round on purpose: nothing here is a real company's figure,
 * and nothing here is a rule for choosing a stock. The test for this page is
 * that a student can read a headline afterwards — not that they know what to
 * buy.
 *
 * Definitions (no figures): 發行量加權股價指數 is TWSE's index of listed
 * stocks weighted by market value; 除息 lowers the reference price by the
 * cash dividend; EPS = 稅後淨利 ÷ 流通在外股數; 本益比 = 股價 ÷ EPS;
 * 殖利率 = 每股股利 ÷ 股價.
 */

export default function Module42() {
  return (
    <>
      <Section title="新聞裡的那些詞，其實是幾個簡單的除法">
        <P>
          打開財經新聞，常看到「加權指數漲 150 點」「EPS 創新高」「殖利率 5%」。這些詞聽起來很專業，但大多只是一個數字除以另一個數字。這一站只做一件事：讓你看得懂這些詞在說什麼。它<Term>不是選股方法</Term>
          ——看懂一個詞，跟知道該不該買，是兩回事。
        </P>
        <P>
          下面用一家<Term>虛構的公司「晴光電子」</Term>
          來舉例，數字都是為了好算而設定的整數，不是任何真實公司的資料。
        </P>
      </Section>

      <Section title="整個市場：加權指數">
        <P>
          新聞說的「台股」漲跌，通常指台灣證券交易所編製的<Term>發行量加權股價指數</Term>
          （簡稱加權指數）。它把所有上市股票放在一起算，而且<Term>按市值加權</Term>
          ：市值越大的公司，對指數的影響越大。所以「指數漲了」不代表每一檔都漲，可能只是幾家大公司漲得多。「漲 150 點」說的是指數本身的點數變化，不是某一檔股票漲了 150 元。
        </P>
      </Section>

      <Section title="一家公司：市值、EPS、本益比">
        <Bullets
          items={[
            <>
              <Term>市值</Term>：股價 × 股數，代表市場現在給這家公司的總價格。晴光電子股價 100 元、有 1 億股，市值就是 100 億元。
            </>,
            <>
              <Term>EPS（每股盈餘）</Term>：公司一年的稅後淨利 ÷ 股數，也就是「每一股分到多少獲利」。晴光電子去年賺 5 億元、1 億股，EPS 就是 5 元。
            </>,
            <>
              <Term>本益比</Term>：股價 ÷ EPS。晴光電子 100 ÷ 5 ＝ 20 倍，意思是用現在的價格買，要 20 年份的獲利才等於股價。
            </>,
          ]}
        />
        <Worked
          title="晴光電子（虛構）"
          accent={C}
          rows={[
            { label: "股價", value: "100 元" },
            { label: "股數", value: "1 億股" },
            { label: "市值（100 × 1 億）", value: "100 億元" },
            { label: "去年稅後淨利", value: "5 億元" },
            { label: "EPS（5 億 ÷ 1 億股）", value: "5 元" },
            { label: "本益比（100 ÷ 5）", value: "20 倍", strong: true },
          ]}
          note="本益比用的是「過去」的獲利，股價反映的卻是大家對「未來」的看法——所以同一個本益比，放在不同公司身上意思可能完全不同。"
        />
      </Section>

      <Section title="配錢給股東：股利、殖利率、除權息">
        <Bullets
          items={[
            <>
              <Term>股利</Term>：公司把獲利分給股東。發現金叫<Term>現金股利</Term>
              （配息），發股票叫<Term>股票股利</Term>（配股）。
            </>,
            <>
              <Term>殖利率</Term>：每股股利 ÷ 股價。晴光電子每股配 3 元現金股利，股價 100 元，殖利率就是 3%。股價變了，殖利率也跟著變。
            </>,
            <>
              <Term>除息、除權</Term>：配息那一天叫除息，配股那一天叫除權。除息日的參考價會先扣掉配出去的現金：晴光電子前一天收 100 元、配 3 元，除息日參考價就是 97 元。錢只是從「股價」移到「你的帳戶」，不是憑空多出來的。
            </>,
          ]}
        />
        <MistakeNote>
          <p>
            以為「配息就是多賺的錢」。除息當天股價會先扣掉股利，之後股價漲回原本的價位（新聞說的「填息」）才算真的多了；漲不回去，配到的股利只是把自己的錢拿回來一部分。
          </p>
        </MistakeNote>
      </Section>

      <Callout label="看懂，不等於會選" color={C}>
        <p>
          本益比低、殖利率高、EPS 創新高，都只是描述一個數字，不是「該買」的訊號。這一站刻意不教任何「超過多少就買」的規則——那種規則不存在，看到有人這樣說，就跟詐騙線學到的「保證獲利」一樣，值得多想一步。
        </p>
      </Callout>

      <Scenario color={C}>
        <p>
          你看到一則新聞標題：「晴光電子去年 EPS 5 元，擬配現金股利 3 元，以昨日收盤價 100 元計算殖利率 3%，下週除息。」試著用自己的話，把這句話翻譯給朋友聽：每一個數字是怎麼來的？除息那天，股價的參考價會變成多少？
        </p>
      </Scenario>
    </>
  );
}
