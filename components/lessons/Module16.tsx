import {
  Section,
  P,
  Term,
  Bullets,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#6C5B7B";

export default function Module16() {
  return (
    <>
      <Section title="三個選項，各有各的取捨">
        <Bullets
          items={[
            <>
              <Term>住宿舍</Term>：三個選項中通常最便宜，但名額有限且生活自由度較低。
            </>,
            <>
              <Term>在外租屋</Term>：成本較高，但生活彈性大。
            </>,
            <>
              <Term>通勤</Term>：省下住宿費，但要算進交通時間與交通費的隱性成本。
            </>,
          ]}
        />
        <P>三個選項沒有絕對的對錯，是根據預算與生活型態的取捨。</P>
      </Section>

      <InfoBoard>
        <p>
          各大學宿舍床位供不應求是普遍現象。建議用「四年總成本」（含押金、租金、交通費）比較，而不是只看單一數字。
        </p>
      </InfoBoard>

      <Section title="租金數字之外，還有什麼？">
        <P>
          只比較「每月租金」數字，沒把押金、水電、交通時間成本一起算進去，是最常見的低估陷阱。
        </P>
        <MistakeNote>
          <p>只看月租金決定，忽略押金（通常 1-2 個月租金）、水電雜費，以及通勤時間換算成的隱性成本。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          住宿舍每月 NT$3,500，在外租屋每月 NT$8,000，通勤每月 NT$1,500（但每天多花 1 小時通勤）。如果是你，你會怎麼選？時間的價值，你會怎麼算進去？
        </p>
      </Scenario>
    </>
  );
}
