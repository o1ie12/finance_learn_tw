import { lineAccentForModule } from "@/lib/lines";
import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = lineAccentForModule(14).color;

export default function Module14() {
  return (
    <>
      <Section title="單學期學費，不是真正的價格">
        <P>
          公立大學與私立大學的學雜費差距明顯。教育部 112 年的資料：公立大專每年平均學雜費約 6.2 萬元，私立約 11 萬元，一年就差
          <Term>將近 5 萬元</Term>。四年加起來差更多，還不包含住宿與生活費。
        </P>
        <P>
          這個數字在選校時經常被低估，因為大部分人只看單學期學費，沒有換算成
          <Term>四年總價</Term>：選校選系時，四年總價才是真正該拿來比較的數字。
        </P>
      </Section>

      <InfoBoard>
        <p>
          台灣公私立大學學雜費差距為長期存在的結構性差異，教育部每年公告最新學雜費標準。政府從 113 年 2 月起，私立大專學士班學生每學期可減免學雜費 1.75 萬元，差距變小了，但還在。實際要繳多少，以學校公告為準。
        </p>
      </InfoBoard>

      <MistakeNote>
        <p>
          只比較「這學期要繳多少」，沒有把四年總額、住宿、交通一起算進去做決定。等入學後才發現總負擔比想像中重。
        </p>
      </MistakeNote>

      <Scenario color={C}>
        <p>
          用教育部 112 年公布的平均值：公立一年學雜費約 NT$62,000，私立約 NT$110,000。四年下來，兩者總額差多少？如果私立每學期減免 NT$17,500，四年（8 個學期）後差距又變成多少？這個數字會怎麼影響你的選校決定？
        </p>
      </Scenario>
    </>
  );
}
