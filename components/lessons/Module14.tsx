import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#6C5B7B";

export default function Module14() {
  return (
    <>
      <Section title="單學期學費，不是真正的價格">
        <P>
          公立大學與私立大學的學雜費差距明顯，四年加總下來，私立大學的學費總額通常是公立的
          <Term>一倍以上</Term>，還不包含住宿與生活費。
        </P>
        <P>
          這個數字在選校時經常被低估，因為大部分人只看單學期學費，沒有換算成
          <Term>四年總價</Term>——選校選系時，四年總價才是真正該拿來比較的數字。
        </P>
      </Section>

      <InfoBoard>
        <p>
          台灣公私立大學學雜費差距為長期存在的結構性差異，教育部每年公告最新學雜費標準。
        </p>
      </InfoBoard>

      <MistakeNote>
        <p>
          只比較「這學期要繳多少」，沒有把四年總額、住宿、交通一起算進去做決定。等入學後才發現總負擔比想像中重。
        </p>
      </MistakeNote>

      <Scenario color={C}>
        <p>
          如果公立學費一學期 NT$29,000，私立一學期 NT$58,000，四年（8 個學期）下來，兩者總額差多少？這個數字會怎麼影響你的選校決定？
        </p>
      </Scenario>
    </>
  );
}
