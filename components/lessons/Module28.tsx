import { Section, P, Callout, Scenario } from "@/components/lesson";

const C = "#7a3d20";

export default function Module28() {
  return (
    <>
      <Section title="押金該退多少，最常見的爭議">
        <P>
          退租時最常見的爭議是「押金該退多少」。房東不能無故扣留押金，只能就實際損壞（超出正常使用磨損範圍）扣除修復費用，建議入住與退租時都拍照存證，作為爭議發生時的證據。
        </P>
      </Section>

      <Callout label="台灣現況" color={C}>
        <p>
          押金上限依內政部定型化契約規定不得超過 2 個月租金，退租爭議時可向各縣市消費者保護官或內政部申訴管道求助。
        </p>
      </Callout>

      <Section title="沒有照片，就很難舉證">
        <P>
          退租時沒有留下入住與退租時的照片證據，發生押金爭議時難以舉證屋況變化——這是最常見、也最容易避免的疏忽。
        </P>
        <Callout label="⚠ 常見錯誤" color={C}>
          <p>
            退租時沒有留下入住與退租時的照片證據，一旦房東主張有損壞，很難證明是不是自己造成的。
          </p>
        </Callout>
      </Section>

      <Scenario color={C}>
        <p>
          搬進新租屋處的第一天，你會拍哪些角落作為存證？想想看，哪些地方最容易在退租時引發爭議。
        </p>
      </Scenario>
    </>
  );
}
