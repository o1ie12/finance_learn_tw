import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  Callout,
  Bullets,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(32).color;

export default function Module32() {
  return (
    <>
      <Section title="「存錢又有保障」聽起來很好，但保障通常很低">
        <P>
          儲蓄險常被包裝成「存錢又有保障」，但實際上保障部分通常很低，主要功能是強迫儲蓄，
          <Term>提前解約經常會虧本</Term>，報酬率也不一定比其他投資工具好。
        </P>
      </Section>

      <InfoBoard>
        <p>金管會多次提醒消費者購買儲蓄險前應清楚了解解約金與實際報酬率，避免與定存混淆。</p>
      </InfoBoard>

      <Section title="業務員會用到的幾個詞">
        <Bullets
          items={[
            <>
              <Term>預定利率</Term>
              ：保險公司算保費時假設的利率，簽約時就固定了。
            </>,
            <>
              <Term>宣告利率</Term>
              ：利率變動型保單由保險公司定期公告的利率，會變動，不保證。業務員舉的「試算」常用它，但未來不一定照著走。
            </>,
            <>
              <Term>解約金</Term>
              ：提前解約時拿得回來的錢。保單前幾年的解約金，常常比你已經繳的保費還少。
            </>,
            <>
              <Term>增額型、還本型、利變型</Term>
              ：增額型的保額逐年變大；還本型會定期發還一筆生存金；利變型的回饋跟著宣告利率變動。名字不同，都還是要看解約金表。
            </>,
          ]}
        />
        <Callout label="一個問題就夠了" color={C}>
          <p>
            問業務員：「如果我在第 6 年或第 10 年解約，這張保單的報酬率（內部報酬率，IRR）是多少？可以給我看解約金表嗎？」拿這個數字去跟定存比，比聽「存錢又有保障」清楚得多。
          </p>
        </Callout>
      </Section>

      <Section title="業務員為什麼特別愛推儲蓄險">
        <P>業務員推銷儲蓄險的佣金通常較高，這是它被大量推銷的原因之一——不代表它一定不好，但值得多想一步再決定。</P>
        <MistakeNote>
          <p>把儲蓄險當成「更好的定存」。儲蓄險有保單期間限制，提前解約通常會虧損本金，流動性遠不如定存。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>業務員跟你說「這張保單存錢又有保障，比定存划算多了」，你會先問哪一個問題來確認這句話是不是真的？</p>
      </Scenario>
    </>
  );
}
