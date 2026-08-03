import {
  Section,
  P,
  Term,
  Bullets,
  Callout,
  Compare,
  Worked,
  Scenario,
} from "@/components/lesson";

const C = "#0070bd";

export default function Module2() {
  return (
    <>
      <Section title="記帳不是懲罰，是把錢看清楚">
        <P>
          很多人一聽到「記帳」就想到「不能花錢」。其實記帳只是做一件事：{" "}
          <Term>把錢去了哪裡看清楚</Term>
          。看清楚之後，你才有辦法決定要不要調整。這一課給你一套簡單、又能持續下去的方法，而且是用你每天在用的行動支付來做。
        </P>
      </Section>

      <Section title="第一步：分清楚「需要」和「想要」">
        <P>
          每一筆花費，先問自己一句：這是<Term>需要（need）</Term>，還是{" "}
          <Term>想要（want）</Term>？
        </P>
        <Bullets
          items={[
            <>
              <Term>需要</Term>：維持生活與上學所必需的。例如通學的{" "}
              <span className="money">NT$25</span> MRT 車資、悠遊卡加值、午餐。
            </>,
            <>
              <Term>想要</Term>：可有可無、帶來享受的。例如一杯{" "}
              <span className="money">NT$65</span>{" "}
              的限量聯名手搖、遊戲課金、第三雙球鞋。
            </>,
          ]}
        />
        <P>
          想要不是壞事，只是要「有意識地留給它一個位置」，而不是把每一筆想要都當成需要照單全收。
        </P>
      </Section>

      <Section title="第二步：一套超簡單的預算框架">
        <P>
          你不需要複雜的表格。假設你一週有{" "}
          <span className="money">NT$1,000</span>{" "}
          可用（零用錢加打工），可以先粗略分成三份：
        </P>
        <Worked
          title="每週 NT$1,000 的一種分法"
          accent={C}
          rows={[
            { label: "需要（車資、午餐等固定花費）", value: "NT$500" },
            { label: "想要（手搖、娛樂、和朋友出去）", value: "NT$300" },
            { label: "先存起來", value: "NT$200", strong: true },
          ]}
          note="比例不是鐵律，重點是「先分好、先把要存的挪走」，剩下的才是可以自由花的。"
        />
        <P>
          關鍵動作是：<Term>發薪水／領零用錢的當下，就先把要存的那份挪開</Term>
          ，而不是月底看剩多少才存。剩下的才是你這週能安心花的錢。
        </P>
      </Section>

      <Section title="第三步：用你的行動支付來記帳">
        <P>
          在台灣，多數學生根本不是用實體金融卡在付錢——而是掏出手機。這一點跟很多國外理財內容很不一樣，那些內容常常預設「大家都刷 debit
          card」。
        </P>
        <Compare
          accent={C}
          us={<>預設用實體 debit card 消費，再看銀行 App 對帳。</>}
          tw={
            <>
              日常小額多半用行動支付付款，交易紀錄就留在 App
              裡，天生就是一份現成的帳本。
            </>
          }
        />
        <P>三個你一定要認得的名字：</P>
        <Bullets
          items={[
            <>
              <Term>街口支付（JKoPay）</Term>：到 2026 年，仍是台灣單一 App
              用戶基礎最大的電子支付之一，很多店家、夜市都能用。
            </>,
            <>
              <Term>LINE Pay</Term>：近年已經和一卡通拆夥，改成獨立經營的電子支付，成長很快，綁在你天天在用的 LINE 裡。
            </>,
            <>
              <Term>台灣Pay</Term>：政府支持的選項，日常消費比較少見，但{" "}
              <Term>綜所稅退稅入帳、繳政府規費</Term>{" "}
              常會用到它。
            </>,
          ]}
        />
        <Callout label="小技巧" color={C}>
          <p>
            大部分行動支付 App 都有「交易明細」。每週花五分鐘滑一遍，把每筆標成「需要」或「想要」，你會很快看出錢都花去哪。
          </p>
        </Callout>
      </Section>

      <Section title="第四步：每週回顧一次">
        <P>
          記帳最容易失敗的原因，是把它想得太費工。其實你只要固定挑一個時間——例如每週日晚上——打開
          App 滑一遍，看三件事：這週存到目標了嗎？想要的花費有沒有爆掉？下週要不要微調？
        </P>
        <P>
          持續一個月，你對自己的錢就會有一種「握得住」的感覺。這種掌控感，比任何一次省錢都值錢。
        </P>
      </Section>

      <Scenario color={C}>
        <p>
          這週你有 <span className="money font-semibold">NT$1,000</span>
          。週三朋友臨時揪你去看電影加吃飯，大約要{" "}
          <span className="money font-semibold">NT$450</span>。
        </p>
        <p>
          如果你已經先把{" "}
          <span className="money font-semibold">NT$200</span>{" "}
          存起來，這 450
          會從哪一份出？要動用下週的額度嗎？還是這次先婉拒、換個更省的方式和朋友聚？試著用上面的框架幫自己做決定。
        </p>
      </Scenario>
    </>
  );
}
