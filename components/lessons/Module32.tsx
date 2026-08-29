import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#16A085";

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
