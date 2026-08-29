import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  getRentOption,
  computeSimulation,
  type SimOutcome,
  type RentChoiceId,
} from "@/lib/simulation";
import {
  computeSavings,
  isSavingsGoalId,
  isSavingsStorageId,
  type SavingsOutcome,
} from "@/lib/sims/savings";
import {
  computeHousing,
  getHousing,
  isHousingId,
  type HousingOutcome,
} from "@/lib/sims/housing";
import {
  computeInvesting,
  getInvestChoice,
  isInvestChoiceId,
  type InvestOutcome,
} from "@/lib/sims/investing";
import { BackendNotConfiguredError } from "@/lib/db";
import type { SimulationRun } from "@/lib/types";

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

// ---------------------------------------------------------------------------
// Cross-line coach (存錢線 / 信用線 / 投資線) via OpenRouter.
//
// qixin keeps calling Anthropic directly, above — it already works, and
// "reuse the architecture" means the shared shape (system prompt + one
// grounded user message built from real numbers + CoachResult), not
// literally sharing the SDK client. The other three lines route through
// OpenRouter (OpenAI-compatible) so the model is swappable via
// OPENROUTER_MODEL without a code change, per .env.example's Section 9 note.
// ---------------------------------------------------------------------------
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const COACH_CONSTRAINTS =
  "Never suggest a real financial product, a specific stock, or a specific bank. Never give advice framed as applying to the student's real life or real money, only to the simulated scenario they just ran. If asked anything outside the scope of this simulation, redirect the student back to the course modules.";

const SAVINGS_SYSTEM_PROMPT = `You are a financial literacy coach for a Taiwanese high school personal finance course. A student just finished a simulation where they set a savings goal, chose a monthly deposit and where to store it, and responded to a series of temptation events along the way. You will receive their goal, plan, and how their actual choices compared to "resisted every temptation" and "gave in every time." Respond in Traditional Chinese, in 3 to 5 sentences. Point out one specific strength in their choices and one specific tradeoff they may not have considered, using the actual numbers they were given. ${COACH_CONSTRAINTS}`;

const HOUSING_SYSTEM_PROMPT = `You are a financial literacy coach for a Taiwanese high school personal finance course. A student just finished a simulation where they chose where to live after their first job (with parents, roommates, or alone) and how to furnish the place (cash or installment). You will receive their choice, monthly cash flow, and upfront cash needed. Respond in Traditional Chinese, in 3 to 5 sentences. Point out one specific strength in their choices and one specific tradeoff they may not have considered, using the actual numbers they were given. ${COACH_CONSTRAINTS}`;

const INVESTING_SYSTEM_PROMPT = `You are a financial literacy coach for a Taiwanese high school personal finance course. A student just finished a simulation where they decided what to do with a lump sum: keep it in a fixed deposit, buy a broad-market or dividend ETF, or spend it, plus whether to participate in an IPO lottery. You will receive their choice and the resulting range of outcomes. Respond in Traditional Chinese, in 3 to 5 sentences. Point out one specific strength in their choices and one specific tradeoff they may not have considered, using the actual numbers they were given. Be especially careful never to frame any option as a recommendation to buy or avoid a real security. ${COACH_CONSTRAINTS}`;

function nt2(n: number): string {
  return `NT$${Math.round(n).toLocaleString("en-US")}`;
}

export function buildSavingsCoachUserMessage(outcome: SavingsOutcome): string {
  const lines: string[] = [
    "以下是這名學生剛完成的「存錢目標模擬」結果，請根據這些數字給回饋：",
    `- 目標：${outcome.goal.label}（${nt2(outcome.goal.amount)}），設定 ${outcome.months} 個月內存到`,
    `- 每月存入：${nt2(outcome.monthlyDeposit)}，存在「${outcome.storage.label}」（年利率 ${(outcome.storage.annualRate * 100).toFixed(1)}%）`,
    `- 路上遇到 ${outcome.temptations.length} 次誘惑，這名學生實際存到 ${nt2(outcome.user.finalAmount)}${
      outcome.user.reachedGoal
        ? "（達成目標）"
        : `（距離目標還差 ${nt2(Math.abs(outcome.user.gap))}）`
    }`,
    `- 對照：若每次都守住計畫會存到 ${nt2(outcome.resistAll.finalAmount)}；若每次都心動花掉只會存到 ${nt2(outcome.giveInAll.finalAmount)}`,
    `- 守住計畫情境下，光靠複利（利息）滾出的部分約 ${nt2(outcome.resistAll.interest)}`,
  ];
  return lines.join("\n");
}

export function buildHousingCoachUserMessage(outcome: HousingOutcome): string {
  const opt = getHousing(outcome.chosen.id);
  const lines: string[] = [
    "以下是這名學生剛完成的「租屋決策模擬」結果，請根據這些數字給回饋：",
    `- 住處選擇：${opt?.label ?? outcome.chosen.id}，${outcome.chosen.housingLabel} ${nt2(outcome.chosen.housingCost)}／月`,
    `- 每月結餘：${nt2(outcome.chosen.leftover)}${outcome.chosen.deficit ? "（入不敷出）" : ""}`,
    `- 一開始要準備的現金（押金＋布置費）：${nt2(outcome.chosen.upfrontCash)}`,
  ];
  if (outcome.furnish === "installment") {
    lines.push(
      `- 布置費選了分期，每月再扣 ${nt2(outcome.furnishInstallmentMonthly)}，共 ${outcome.furnishInstallmentMonths} 期`,
    );
  }
  const cheaper = outcome.all
    .filter((o) => o.housingCost < outcome.chosen.housingCost)
    .sort((a, b) => b.housingCost - a.housingCost)[0];
  if (cheaper) {
    const cheaperOpt = getHousing(cheaper.id);
    lines.push(
      `- 對照：若改選「${cheaperOpt?.label ?? cheaper.id}」，每月結餘會是 ${nt2(cheaper.leftover)}`,
    );
  }
  return lines.join("\n");
}

export function buildInvestingCoachUserMessage(outcome: InvestOutcome): string {
  const choice = getInvestChoice(outcome.chosen.id);
  const lines: string[] = [
    "以下是這名學生剛完成的「第一次投資模擬」結果，請根據這些數字給回饋：",
    `- 這筆錢：${nt2(outcome.start)}`,
    `- 選擇：${choice?.label ?? outcome.chosen.id}`,
  ];
  if (outcome.chosen.id === "spend") {
    lines.push("- 結果：把這筆錢直接花掉了，沒有進入任何投資或儲蓄工具");
  } else if (outcome.chosen.certain) {
    lines.push(`- 結果：幾乎確定會變成約 ${nt2(outcome.chosen.mid)}`);
  } else {
    lines.push(
      `- 結果：一年後可能落在 ${nt2(outcome.chosen.low)} 到 ${nt2(outcome.chosen.high)} 之間，中間值約 ${nt2(outcome.chosen.mid)}`,
    );
  }
  if (outcome.chosen.sellable) {
    lines.push(
      `- 若以中間值賣出，會被課約 ${nt2(outcome.chosen.taxOnMidSale)} 的證交稅（0.3%，賺賠都收），實拿約 ${nt2(outcome.chosen.netAfterTaxMid)}`,
    );
  }
  lines.push(`- 抽籤：${outcome.ipo ? "這次有參加" : "這次沒有參加"}`);
  return lines.join("\n");
}

async function generateCoachMessageViaOpenRouter(
  systemPrompt: string,
  userMessage: string,
): Promise<CoachResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    throw new BackendNotConfiguredError();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": "起點 Qidian",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter request failed: ${res.status} ${detail}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  return { message: text, stub: false };
}

// ---------------------------------------------------------------------------
// Per-line coach dispatch.
//
// qixin uses the live Haiku call above. The other three lines call
// OpenRouter when OPENROUTER_API_KEY + OPENROUTER_MODEL are set (works in
// both dev and production, same as qixin's ANTHROPIC_API_KEY path). Without
// that config: a grounded, deterministic stub in local dev so the panel can
// still be exercised, or the same "not configured" state qixin shows
// without a key in production.
// ---------------------------------------------------------------------------
function devStubEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.USE_DEV_STORE === "1"
  );
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function lineStub(run: SimulationRun): string {
  const o = run.outcome_summary as Record<string, unknown>;
  if (run.line_slug === "cunqian") {
    const goal = (o.goal as Record<string, unknown>) ?? {};
    const user = (o.user as Record<string, unknown>) ?? {};
    const resist = (o.resistAll as Record<string, unknown>) ?? {};
    const give = (o.giveInAll as Record<string, unknown>) ?? {};
    return `你的目標是「${str(goal.label, "存錢目標")}」（${nt(num(goal.amount))}）。守住計畫大約能存到 ${nt(num(resist.finalAmount))}，但每次都心動就只剩 ${nt(num(give.finalAmount))}——這中間的差距，就是「即時滿足」的代價，也是起薪線第一站講的心理陷阱。你這次的選擇最後是 ${nt(num(user.finalAmount))}。時間和紀律會慢慢把利息滾大，想更了解可以回到「複利站」。這只是模擬情境的練習，不是真的理財建議。`;
  }
  if (run.line_slug === "xinyong") {
    const chosen = (o.chosen as Record<string, unknown>) ?? {};
    return `在這個租屋模擬裡，你選的方案每月結餘約 ${nt(num(chosen.leftover))}，一開始還需要準備約 ${nt(num(chosen.upfrontCash))} 的押金與布置費。優點是你把「住哪裡」當成一個現金流決定在算；要注意的取捨是，房租是最大的固定開銷，也最該分清楚「需要」和「想要」（起薪線記帳站有講）。分期付款雖然當下輕鬆，但總額通常會多一點。這些都只是模擬練習，不是真的財務建議。`;
  }
  if (run.line_slug === "touzi") {
    const chosen = (o.chosen as Record<string, unknown>) ?? {};
    const tax = num(chosen.taxOnMidSale);
    return `你這次把 ${nt(num(o.start))} 選擇「${str(chosen.label, "投資")}」。投資的重點不是猜一個保證數字，而是理解它的「範圍」——同一筆錢可能落在 ${nt(num(chosen.low))} 到 ${nt(num(chosen.high))} 之間。${tax > 0 ? `而且只要賣出，就會被課約 ${nt(tax)} 的證交稅（0.3%），賺賠都收。` : ""}想降低風險，分散是關鍵。這是教育性的模擬，不是個人化的投資建議。`;
  }
  return "這是一次模擬練習的回饋。想更深入，回到課程模組再看一次。";
}

export async function generateCoachForRun(
  run: SimulationRun,
): Promise<CoachResult> {
  // Flagship line: rebuild the outcome from stored choices and use the real
  // (or dev-stub) coach.
  if (
    run.line_slug === "qixin" &&
    typeof run.rent_choice === "string" &&
    run.savings_rate != null &&
    (run.rent_choice === "roommates" ||
      run.rent_choice === "studio" ||
      run.rent_choice === "central")
  ) {
    const outcome = computeSimulation({
      rent: run.rent_choice as RentChoiceId,
      tpass: Boolean((run.spending_choices as Record<string, unknown>)?.tpass),
      savingsRate: run.savings_rate,
    });
    return generateCoachMessage(outcome);
  }

  // The other three lines: rebuild the outcome from stored choices, same as
  // qixin above, then call OpenRouter. Falls back to the dev stub (no key)
  // or "not configured" (production, no key) — same shape as qixin's path.
  const choices = (run.spending_choices as Record<string, unknown>) ?? {};

  try {
    if (
      run.line_slug === "cunqian" &&
      isSavingsGoalId(choices.goalId) &&
      isSavingsStorageId(choices.storageId)
    ) {
      const outcome = computeSavings({
        goalId: choices.goalId,
        storageId: choices.storageId,
        months: Number(choices.months),
        monthlyDeposit: Number(choices.monthlyDeposit),
        temptationResponses: Array.isArray(choices.temptationResponses)
          ? choices.temptationResponses.map(Boolean)
          : [],
      });
      return await generateCoachMessageViaOpenRouter(
        SAVINGS_SYSTEM_PROMPT,
        buildSavingsCoachUserMessage(outcome),
      );
    }

    if (run.line_slug === "xinyong" && isHousingId(choices.housing)) {
      const furnish = choices.furnish;
      const outcome = computeHousing({
        housing: choices.housing,
        furnish:
          furnish === "cash" || furnish === "installment" || furnish === "none"
            ? furnish
            : "cash",
      });
      return await generateCoachMessageViaOpenRouter(
        HOUSING_SYSTEM_PROMPT,
        buildHousingCoachUserMessage(outcome),
      );
    }

    if (run.line_slug === "touzi" && isInvestChoiceId(choices.choice)) {
      const outcome = computeInvesting({
        choice: choices.choice,
        ipo: Boolean(choices.ipo),
      });
      return await generateCoachMessageViaOpenRouter(
        INVESTING_SYSTEM_PROMPT,
        buildInvestingCoachUserMessage(outcome),
      );
    }
  } catch (e) {
    // OpenRouter not configured or the call failed: fall through to the dev
    // stub in local dev, or re-raise as "not configured" in production.
    if (devStubEnabled()) {
      return { message: lineStub(run), stub: true };
    }
    if (e instanceof BackendNotConfiguredError) throw e;
    throw new BackendNotConfiguredError();
  }

  throw new BackendNotConfiguredError();
}
