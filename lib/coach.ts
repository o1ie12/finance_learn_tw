import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getRentOption, type SimOutcome } from "@/lib/simulation";
import { BackendNotConfiguredError } from "@/lib/db";

// Model: Claude Haiku (latest).
const COACH_MODEL = "claude-haiku-4-5";

// System prompt — used as written per the brief, lightly trimmed for length.
const SYSTEM_PROMPT = `You are a financial literacy coach for a Taiwanese high school personal finance course. A student just finished a simulation where they chose how to handle their first salary after graduation. You will receive their rent choice, transit choice, savings rate, and the resulting numbers. Respond in Traditional Chinese, in 3 to 5 sentences. Point out one specific strength in their choices and one specific tradeoff they may not have considered, using the actual numbers they were given. Never suggest a real financial product, a specific stock, or a specific bank. Never give advice framed as applying to the student's real life or real money, only to the simulated scenario they just ran. If asked anything outside the scope of this simulation, redirect the student back to the course modules.`;

function nt(n: number): string {
  return `NT$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Build the user message from ONLY the simulation choices and outcome numbers.
 * No name, school, or any identifying information is included.
 */
export function buildCoachUserMessage(outcome: SimOutcome): string {
  const rent = getRentOption(outcome.chosen.rent);
  const lines: string[] = [
    "以下是這名學生剛完成的「第一份薪水模擬」結果，請根據這些數字給回饋：",
    `- 月薪（稅前）：${nt(outcome.gross)}，扣除勞保 ${nt(outcome.laborInsurance)}、健保 ${nt(outcome.nhi)} 後，實拿約 ${nt(outcome.net)}`,
    `- 租屋選擇：${rent.label}（${rent.area}），房租 ${nt(outcome.chosen.rentCost)}／月`,
    `- 交通：${outcome.tpass ? `使用 TPASS 月票（${nt(outcome.transitCost)}）` : `單程票逐次付（約 ${nt(outcome.transitCost)}／月）`}`,
    `- 生活開銷（伙食、電話、雜支）：約 ${nt(outcome.livingCost)}／月`,
    `- 儲蓄比例：把每月結餘的 ${outcome.savingsRate}% 存起來`,
  ];

  if (outcome.chosen.deficit) {
    lines.push(
      `- 結果：每月入不敷出，短缺約 ${nt(Math.abs(outcome.chosen.leftover))}，無法儲蓄。`,
    );
  } else {
    lines.push(
      `- 結果：每月房租、交通、生活費後剩 ${nt(outcome.chosen.leftover)}；每月存 ${nt(outcome.chosen.monthlySavings)}，一年約可存下 ${nt(outcome.chosen.annualSavings)}。`,
    );
  }

  const cheaper = outcome.alternatives.find(
    (a) => a.rentCost < outcome.chosen.rentCost,
  );
  if (cheaper) {
    const opt = getRentOption(cheaper.rent);
    lines.push(
      `- 對照：若改選「${opt.label}」（房租 ${nt(cheaper.rentCost)}），同樣儲蓄比例下一年約可存 ${nt(cheaper.annualSavings)}。`,
    );
  }

  return lines.join("\n");
}

export interface CoachResult {
  message: string;
  stub: boolean;
}

/**
 * Dev-only deterministic, grounded fallback so the flow (and the dashboard's
 * coach display) can be exercised without an Anthropic API key. Production
 * always uses the live Haiku call below.
 */
function devStubMessage(outcome: SimOutcome): string {
  const rent = getRentOption(outcome.chosen.rent);
  if (outcome.chosen.deficit) {
    return `在這個模擬裡，你選了「${rent.label}」，房租 ${nt(outcome.chosen.rentCost)} 幾乎吃掉了實拿的 ${nt(outcome.net)}，每月還短缺約 ${nt(Math.abs(outcome.chosen.leftover))}，等於還沒開始存錢就先透支。優點是你敢挑戰生活機能最好的地段，但在這份起薪下，這個選擇讓儲蓄率變成 0。如果在模擬中改選房租較低的方案，你就會多出可以存下來的結餘。想更了解怎麼分配，回到「記帳站」和「複利站」再看一次會很有幫助。`;
  }
  return `在這個模擬裡，你選了「${rent.label}」，每月結餘 ${nt(outcome.chosen.leftover)}，並把其中 ${outcome.savingsRate}% 存起來，一年約可存 ${nt(outcome.chosen.annualSavings)}，這個儲蓄習慣是很好的起點。要注意的一個取捨是：${outcome.tpass ? "你用了 TPASS 月票替交通省下固定支出，" : "你選擇逐次付車資，長期下來通常比 TPASS 月票貴一些，"}而房租仍是最大的固定開銷。如果在模擬中把房租再壓低一點，一年能存下的金額會明顯提高。這些都只是模擬情境的練習，想更深入可以回到「複利站」看看時間對存款的影響。`;
}

export async function generateCoachMessage(
  outcome: SimOutcome,
): Promise<CoachResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // In dev-store mode we return a grounded stub so the UI can be tested.
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.USE_DEV_STORE === "1"
    ) {
      return { message: devStubMessage(outcome), stub: true };
    }
    throw new BackendNotConfiguredError();
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: COACH_MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildCoachUserMessage(outcome) }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Coach returned an empty response");
  }

  return { message: text, stub: false };
}
