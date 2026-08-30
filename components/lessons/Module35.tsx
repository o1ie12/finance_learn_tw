import {
  Section,
  P,
  Term,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#D68910";

export default function Module35() {
  return (
    <>
      <Section title="定價不是「成本加一點利潤」這麼簡單">
        <P>
          定價要考慮市場能接受的價格、競爭對手定價、目標客群的消費能力。
          <Term>毛利率</Term>
          （毛利 ÷ 售價）是判斷一個商品好不好賺的關鍵指標。
        </P>
      </Section>

      <MistakeNote>
        <p>定價只看「別人賣多少我也賣多少」，沒有先算清楚自己的成本結構，可能複製了別人的售價卻複製不了別人的成本優勢。</p>
      </MistakeNote>

      <Scenario color={C}>
        <p>一杯飲料成本 NT$15，如果你想維持 60% 的毛利率，售價大概要訂多少？</p>
      </Scenario>
    </>
  );
}
