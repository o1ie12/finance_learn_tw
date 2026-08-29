import {
  Section,
  P,
  Bullets,
  Callout,
  MistakeNote,
  Scenario,
} from "@/components/lesson";

const C = "#E8542A";

export default function Module13() {
  return (
    <>
      <Section title="不是被「特別鎖定」，是個資外流管道很多">
        <P>
          詐騙集團知道你的姓名、電話、購物紀錄，不代表你被「特別鎖定」，而是因為個資外流管道很多：
        </P>
        <Bullets
          items={[
            <>不明連結填寫的表單（釣魚簡訊、假抽獎）。</>,
            <>來路不明的 App 要求過多權限（通訊錄、簡訊）。</>,
            <>購物網站或平台的資料外洩事件。</>,
            <>甚至公開的社群貼文，都可能被蒐集利用。</>,
          ]}
        />
      </Section>

      <Callout label="怎麼提高警覺" color={C}>
        <p>
          收到不明連結，先不要點；App 要求跟功能無關的權限（例如記帳 App 要通訊錄），先想想為什麼；朋友帳號突然傳來奇怪訊息，先用另一個管道（例如打電話）確認本人是否知情。
        </p>
      </Callout>

      <Section title="「不點奇怪連結」不代表完全安全">
        <P>
          很多人覺得只要不點奇怪的連結就安全。但透過合法網站的資料外洩、甚至朋友帳號被盜後傳來的訊息，都可能是外流或詐騙的來源。
        </P>
        <MistakeNote>
          <p>以為「不點連結」就萬無一失。個資外流的管道比想像中多，保持警覺是持續性的習慣，不是一次性的動作。</p>
        </MistakeNote>
      </Section>

      <Scenario color={C}>
        <p>
          一個朋友的帳號突然傳來訊息，要你點一個連結「投票」。你會怎麼確認這真的是朋友本人傳的，而不是帳號被盜？
        </p>
      </Scenario>
    </>
  );
}
