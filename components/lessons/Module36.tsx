import {
  Section,
  P,
  Term,
  InfoBoard,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#D68910";

export default function Module36() {
  return (
    <>
      <Section title="賣多少，才真的開始賺錢">
        <P>
          <Term>損益兩平點</Term>
          是「賣多少數量，收入剛好等於總成本」的那個點，超過這個數量才開始真正賺錢。算出這個數字，能幫助判斷一個生意構想是否實際可行。
        </P>
      </Section>

      <InfoBoard>
        <p>接下來的攤位模擬會直接把固定成本、變動成本、售價代入，算出損益兩平銷售量，不用手算。</p>
      </InfoBoard>

      <MistakeNote>
        <p>只憑感覺覺得「應該會賺錢」，沒有實際算過損益兩平點，開始做了才發現要賣的數量遠超過現實能達到的規模。</p>
      </MistakeNote>

      <Scenario color={C}>
        <p>如果一天的固定成本是 NT$800，每杯毛利是 NT$20，你需要一天賣出幾杯才能打平？</p>
      </Scenario>
    </>
  );
}
