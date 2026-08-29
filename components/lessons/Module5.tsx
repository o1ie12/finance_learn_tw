import {
  Section,
  P,
  Term,
  Bullets,
  Callout,
  Compare,
  Scenario,
} from "@/components/lesson";

const C = "#7f5a1e"; // AA-safe brown ink for in-article accents

export default function Module5() {
  return (
    <>
      <Section title="投資是什麼？">
        <P>
          <Term>投資</Term>{" "}
          就是把錢投入某個東西（例如公司的股票），期待它未來變得更有價值，讓你的錢有機會長得比定存快。代價是：它會上下波動，有機會賺，也有可能虧。這一課帶你認識最基本的觀念，以及台灣獨有的規則。
        </P>
      </Section>

      <Section title="風險與分散：不要把雞蛋放同一個籃子">
        <P>
          單押一家公司，萬一它出事，你的錢就一起遭殃。
          <Term>分散（diversification）</Term>{" "}
          的意思是：把錢分散到很多家公司，一家表現不好，還有其他家撐著。
        </P>
        <P>
          最方便的分散工具是<Term>ETF</Term>
          ——你可以把它想成「一籃子股票」，買一張就等於同時持有很多家公司。台灣最廣為人知的兩檔是：
        </P>
        <Bullets
          items={[
            <>
              <Term>0050</Term>（元大台灣50）：一次持有台灣市值最大的一批公司。
            </>,
            <>
              <Term>0056</Term>（元大高股息）：以配息（發現金給股東）為特色。
            </>,
          ]}
        />
        <P>
          台灣的股票在<Term>台灣證券交易所（TWSE）</Term>
          掛牌交易，你透過證券商下單買賣。
        </P>
        <Callout label="⚠ 常見錯誤" color="#c8102e">
          <p>
            只看報酬率、不看風險——潛在報酬越高，風險通常也越高，定存幾乎沒風險但報酬低，個股可能大賺也可能大賠，ETF
            介於中間。也常把 <Term>0050</Term> 跟 <Term>0056</Term>{" "}
            當成同一種東西：0050 追蹤大盤整體表現，0056 更看重每年配息，兩者篩選邏輯跟適合的投資目標並不一樣。
          </p>
        </Callout>
      </Section>

      <Section title="未滿 18 歲，可以開證券戶嗎？可以，但有規矩">
        <P>在台灣，未成年也能有證券帳戶，但開戶方式和大人不同：</P>
        <Bullets
          items={[
            <>
              必須<Term>臨櫃辦理（本人到場）</Term>，不能像大人那樣純線上點一點就開好。
            </>,
            <>
              要由<Term>父母或法定代理人陪同</Term>。
            </>,
            <>
              需要一個<Term>本人名下、可用來交割的銀行帳戶</Term>
              （買賣的錢從這裡進出）。
            </>,
          ]}
        />
        <Callout label="小知識" color={C}>
          <p>
            父母每年有一筆{" "}
            <span className="money">NT$2,440,000</span>{" "}
            的<Term>贈與稅免稅額</Term>
            ，可以合法地把錢移到孩子的帳戶裡（例如給你投資的本金），在額度內不用課贈與稅。
          </p>
        </Callout>
      </Section>

      <Section title="抽籤：一種低風險的初體驗">
        <P>
          當有公司要新上市（IPO）時，常會開放<Term>抽籤（申購）</Term>
          。你付一筆小額的處理費去登記抽，抽中了就能用承銷價買到一小部分新股，沒抽中錢會退回來。這是很多台灣投資人第一次接觸公開發行的方式——花費小、風險低，很適合當作認識市場的起點。
        </P>
      </Section>

      {/* Standout section: the clearest "this is not America" moment */}
      <section
        className="mt-10 overflow-hidden rounded-2xl bg-ink text-white"
        style={{ borderTop: "6px solid #c48c31" }}
      >
        <div className="p-6 sm:p-8">
          <p
            className="font-display text-xs font-bold uppercase tracking-widest"
            style={{ color: "#e6b25a" }}
          >
            這裡不是美國 · 全課程最關鍵的一段
          </p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            賣股「賺錢」不課所得稅——但每次賣，都要繳證交稅
          </h2>

          <div className="mt-4 space-y-4 text-[15px] leading-[1.85] text-white/90">
            <p>
              在美國，賣股票賺到的價差要繳<Term>資本利得稅（capital gains tax）</Term>
              。<span className="font-bold text-white">台灣完全不一樣。</span>
            </p>
            <p>
              台灣的<Term>個人</Term>買賣股票，
              <span className="font-bold text-white">價差獲利本身目前不課所得稅</span>
              。取而代之的是：每一次<Term>賣出</Term>，都會自動被課一筆{" "}
              <span className="font-bold" style={{ color: "#e6b25a" }}>
                0.3% 的證券交易稅
              </span>
              ，而且是<Term>按成交金額</Term>課，
              <span className="font-bold text-white">不論你這筆是賺還是賠</span>
              。若是同一檔股票當天買進又賣出（當沖），證交稅降為 0.15%。
            </p>
          </div>

          {/* worked example */}
          <div className="mt-6 rounded-xl bg-white/5 p-5 ring-1 ring-white/15">
            <p className="text-sm font-bold" style={{ color: "#e6b25a" }}>
              舉例：賣出 NT$100,000 的 0050（非當沖）
            </p>
            <dl className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/80">成交金額</dt>
                <dd className="money text-white">NT$100,000</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/80">證交稅（0.3%）</dt>
                <dd className="money text-lg font-semibold text-white">
                  NT$300
                </dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-white/15 pt-3 text-sm leading-relaxed text-white/80">
              不管你這 100,000 是賺來的還是賠著賣，這{" "}
              <span className="money font-semibold text-white">NT$300</span>{" "}
              都會被自動收走。（實際下單另有給券商的手續費，這裡先聚焦在「稅」的部分。）
            </p>
          </div>
        </div>
      </section>

      <Section title="小結：用台灣的規則思考">
        <Compare
          accent={C}
          us={<>賣股賺錢 → 依獲利課資本利得稅；賠錢賣則通常沒有這筆稅。</>}
          tw={
            <>
              賣股 → 不論賺賠，一律按成交金額課 0.3% 證交稅（當沖 0.15%）；
              價差獲利本身不課所得稅。
            </>
          }
        />
        <P>
          記住這個差別，你在想「要不要賣、賣多少」時，考量的東西就和美國投資人不一樣。
        </P>
      </Section>

      <Scenario color={C}>
        <p>
          你手上有一檔 ETF，現在賣掉可以拿回{" "}
          <span className="money font-semibold">NT$50,000</span>。
        </p>
        <p>
          先算算看：這一筆賣出，會被自動課多少證交稅（非當沖）？答案是{" "}
          <span className="money font-semibold">NT$150</span>
          （= 50,000 × 0.3%）。再想一想：如果你打算「今天買、今天就賣」，稅率會變成多少？
        </p>
      </Scenario>
    </>
  );
}
