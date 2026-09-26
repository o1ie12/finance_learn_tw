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
  computeInvesting,
  getInvestChoice,
  isInvestChoiceId,
  type InvestOutcome,
} from "@/lib/sims/investing";
import { BackendNotConfiguredError } from "@/lib/db";
import type { SimulationRun } from "@/lib/types";
import { readStoredResult } from "@/lib/sims/types";

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
      "X-Title": "錢途 Finline",
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
// Retired qixin_salary_v1 rows use the live Haiku call above; cunqian and
// touzi_investing_v1 call OpenRouter when OPENROUTER_API_KEY +
// OPENROUTER_MODEL are set. Every other line — and any of those when the
// LLM is unconfigured or fails — gets lineStub(): deterministic, grounded in
// the run's own figures, in every environment. `stub: true` on the response
// tells the panel not to present it as AI-generated.
// ---------------------------------------------------------------------------
/** Deterministic dev-mode feedback, grounded in the run's actual figures.
 *
 * Branches on `kind` rather than the line, so a line whose simulation has
 * been replaced cannot be described using the previous simulation's fields.
 * That is the exact failure this contract exists to prevent: after 信用線's
 * swap this function still described a rent simulation, reading
 * chosen.leftover and chosen.upfrontCash from a credit-card outcome and
 * rendering NT$0 for both. */
function lineStub(run: SimulationRun): string {
  const generic =
    "這是一次模擬練習的回饋。想更深入，回到課程模組再看一次。";
  const result = readStoredResult(run.kind, run.outcome_summary);
  if (!result) return generic;

  switch (result.kind) {
    case "zhiya_career_choice_v1": {
      const { pathName, startingIncome, monthsWithoutIncome, fiveYearTotal } =
        result.outcome;
      const rampNote =
        monthsWithoutIncome > 0
          ? `這條路前面大約有 ${monthsWithoutIncome} 個月幾乎沒有收入，`
          : "這條路幾乎可以馬上開始賺錢，";
      return `你選的是「${pathName}」。${rampNote}之後起薪大約 ${nt(startingIncome)}，五年累積下來約 ${nt(fiveYearTotal)}。重點不是哪條路「比較好」，而是它們的形狀不一樣：有的先慢後快，有的一開始就穩定但成長平緩。你之後在消費線要分配的錢，就是從這個收入來的。這些數字是示意用的範例，不是查證過的薪資統計。`;
    }

    case "xiaofei_needs_wants_v1": {
      const {
        income, needsTotal, wantsTotal, savings, underfunded,
        absorbedShortfall, shortfallGap, incomeFromCareer,
      } = result.outcome;
      const source = incomeFromCareer
        ? "這筆收入是你在職涯線選的那條路來的。"
        : "這筆收入用的是預設值，你可以先去職涯線選一條路，再回來看看差別。";
      const needNote =
        underfunded.length > 0
          ? `不過「${underfunded.join("、")}」分配得偏低，實際生活可能撐不住。`
          : "需要的部分都有顧到。";
      const bufferNote = absorbedShortfall
        ? "月底突然要修車的時候，你還有餘裕吃得下來——這就是留一點的價值。"
        : `月底突然要修車 NT$3,000，你差了 ${nt(shortfallGap)}。不是因為賺太少，是因為沒有留。`;
      return `這個月你有 ${nt(income)}：需要花了 ${nt(needsTotal)}，想要花了 ${nt(wantsTotal)}，留下 ${nt(savings)}。${needNote}${bufferNote}${source}這只是模擬練習，不是真的財務建議。`;
    }

    case "cunqian_savings_v1": {
      const { goal, user, resistAll, giveInAll } = result.outcome;
      return `你的目標是「${goal.label}」（${nt(goal.amount)}）。守住計畫大約能存到 ${nt(resistAll.finalAmount)}，但每次都心動就只剩 ${nt(giveInAll.finalAmount)}——這中間的差距，就是「即時滿足」的代價，也是起薪線第一站講的心理陷阱。你這次的選擇最後是 ${nt(user.finalAmount)}。時間和紀律會慢慢把利息滾大，想更了解可以回到「複利站」。這只是模擬情境的練習，不是真的理財建議。`;
    }

    case "xinyong_credit_card_v1": {
      const { totalInterest, totalIfNoInterest, creditRecord } = result.outcome;
      return totalInterest > 0
        ? `這三期帳單你消費了 ${nt(totalIfNoInterest)}，但因為沒有每期全額繳清，額外產生了 ${nt(totalInterest)} 的循環利息，信用記錄是「${creditRecord}」。循環利息從消費當天就開始算（信用線帳單站有講），所以「只繳最低」不是把帳延後，而是讓它變貴。下次可以練習的是：刷卡之前先想好這筆錢月底怎麼全額還掉。這只是模擬練習，不是真的財務建議。`
        : `這三期帳單你每期都全額繳清，消費 ${nt(totalIfNoInterest)} 就只付了 ${nt(totalIfNoInterest)}，完全沒有產生循環利息，信用記錄是「${creditRecord}」。這正是信用卡最划算的用法——在繳款截止日前全額還清，等於免費借用一段時間的資金。保持這個習慣，之後要辦分期或貸款時會輕鬆很多。這只是模擬練習，不是真的財務建議。`;
    }

    case "touzi_investing_v1": {
      const { start, chosen, startFromSavingsLine } = result.outcome;
      const tax = chosen.taxOnMidSale;
      const origin = startFromSavingsLine === true ? "" : "（這是預設金額，不是你存錢線的數字）";
      return `你這次把 ${nt(start)}${origin} 選擇「${chosen.label}」。投資的重點不是猜一個保證數字，而是理解它的「範圍」——同一筆錢可能落在 ${nt(chosen.low)} 到 ${nt(chosen.high)} 之間。${tax > 0 ? `而且只要賣出，就會被課約 ${nt(tax)} 的證交稅（ETF 0.1%），賺賠都收。` : ""}想降低風險，分散是關鍵。這是教育性的模擬，不是個人化的投資建議。`;
    }

    case "touzi_investing_v2": {
      const { start, chosen, startFromSavingsLine, timing, historical } = result.outcome;
      const origin = startFromSavingsLine ? "" : "（這是預設金額，不是你存錢線的數字）";
      const tax = chosen.taxOnMidSale;
      const timingLabel = timing === "dca" ? "定期定額" : "一次投入";
      let hindsight = "";
      if (historical) {
        const mine = timing === "dca" ? historical.dca.finalValue : historical.lump.finalValue;
        const other = timing === "dca" ? historical.lump.finalValue : historical.dca.finalValue;
        const otherLabel = timing === "dca" ? "一次投入" : "定期定額";
        hindsight =
          historical.betterInHindsight === "same"
            ? `在 ${historical.from} 到 ${historical.to} 這一年的真實價格裡，${timingLabel}和${otherLabel}最後幾乎一樣，都是 ${nt(mine)} 左右。`
            : `在 ${historical.from} 到 ${historical.to} 這一年的真實價格裡，你選的${timingLabel}最後是 ${nt(mine)}，${otherLabel}會是 ${nt(other)}。這個差距是這一年價格怎麼走決定的——換一年，答案可能反過來。事前沒有人知道哪個會比較好，所以這不是「你選對／選錯」，是兩種承受波動的方式。`;
      }
      // Only name the timing where it existed as a choice. 定存 and 花掉 have no
      // timing decision, and "用一次投入的方式選擇放定存" describes one anyway.
      const how = historical ? `用${timingLabel}的方式` : "";
      return `你這次把 ${nt(start)}${origin} ${how}選擇「${chosen.label}」。投資的重點不是猜一個保證數字，而是理解它的「範圍」——同一筆錢可能落在 ${nt(chosen.low)} 到 ${nt(chosen.high)} 之間。${hindsight}${tax > 0 ? `而且只要賣出，就會被課約 ${nt(tax)} 的證交稅（ETF 0.1%），賺賠都收。` : ""}這是教育性的模擬，不是個人化的投資建議。`;
    }

    // qixin has its own richer path above; the rest have no bespoke stub.
    case "qixin_salary_v1":
    case "xinyong_housing_v1":
    case "zhapian_fraud_v1":
    case "xuedai_student_loan_v1":
    case "baoshui_tax_v1":
    case "zuwu_lease_v1":
    case "baoxian_sales_pitch_v1":
    case "chuangye_bubble_tea_v1":
      return generic;

    case "touzi_twse_reflection_v1": {
      const {
        suggestedAmount,
        plannedAmount,
        beyondPosition,
        overCommitment,
        inShortfall,
        hasInvested,
        intent,
      } = result.outcome;
      if (beyondPosition) {
        return `你規劃投入 ${nt(plannedAmount)}，但以你目前的財務狀況大概只有 ${nt(suggestedAmount)}，多了 ${nt(overCommitment)}。投資最常見的失敗不是選錯標的，是投入了自己其實需要的錢——一旦臨時要用，就被迫在最差的時機賣掉。先確認這筆錢短期內用不到，再決定投入多少。這只是模擬練習，不是真的財務建議。`;
      }
      if (inShortfall && hasInvested) {
        return `你規劃投入 ${nt(plannedAmount)}，這在你手上的金額之內。不過你在消費線那個月是差錢收尾的——每個月撐不撐得住，跟手上有沒有一筆錢可以投資，是兩件不同的事。先把月底補起來，通常比先開始投資更要緊。這只是模擬練習，不是真的財務建議。`;
      }
      if (!hasInvested) {
        return `這次你選擇先不投入${intent === "no" ? "，而且覺得現階段不適合自己" : "，想再多了解一點"}。這是一個完整的決定，不是沒有決定——搞清楚規則之前不投入，比跟著別人進場合理得多。真正要練習的是：下次你會用什麼標準判斷「我現在懂得夠多了」。這只是模擬練習，不是真的財務建議。`;
      }
      return `你規劃投入 ${nt(plannedAmount)}，在你手上的 ${nt(suggestedAmount)} 之內。量力而為這件事聽起來很無聊，但它是少數幾乎不會出錯的原則——投入的金額小到就算全部虧掉也不影響生活，你才有辦法撐過中間的波動。這只是模擬練習，不是真的財務建議。`;
    }

    case "baoshui_tax_filing_v1": {
      const {
        methodCorrect,
        method,
        taxGap,
        taxOwed,
        studentTax,
        netIncome,
        isRefund,
        balance,
        stepsCorrect,
      } = result.outcome;
      const settle = `${isRefund ? "可以退稅" : "要補繳"} ${nt(Math.abs(balance))}`;
      if (!methodCorrect && taxGap === 0) {
        return `三關你答對了 ${stepsCorrect} 關，最後的稅額 ${nt(taxOwed)} 也是對的——但你選的算法其實不對，只是這個案例剛好算出同一個數字。${method === "flat_top" ? "把淨額全部乘上最高級距的稅率，只有在所得剛好落在第一級距時才會碰巧相等；換一個收入高一點的人就會差很多。" : "用全年收入直接乘稅率，只有在扣除額剛好把稅額壓到零時才會看起來沒差。"}誤解能活這麼久，通常就是因為它偶爾會剛好算對。這只是模擬練習，不是真的財務建議。`;
      }
      if (!methodCorrect) {
        return `你算出來要繳 ${nt(studentTax)}，實際上是 ${nt(taxOwed)}，差了 ${nt(Math.abs(taxGap))}。${method === "gross" ? "問題出在用全年收入直接乘稅率——免稅額和扣除額要先減掉，稅是從「所得淨額」開始算的，這個案例的淨額是 " + nt(netIncome) + "。" : "問題出在把所得淨額全部乘上最高的那個級距稅率。累進稅率只有超過級距的那一段才用高稅率，這就是速算公式在做的事。"}結算下來${settle}。這只是模擬練習，不是真的財務建議。`;
      }
      return `三關你答對了 ${stepsCorrect} 關，算法也選對了：從所得淨額 ${nt(netIncome)} 出發，只有超過級距的部分才用比較高的稅率，應納稅額 ${nt(taxOwed)}，結算下來${settle}。會自己算這一遍的意義是，之後看到扣繳憑單和報稅軟體帶出來的數字，你有能力判斷它合不合理。這只是模擬練習，不是真的財務建議。`;
    }

    case "capstone_buy_vs_rent_v1": {
      const {
        choice,
        verdict,
        canCoverDownPayment,
        downPaymentRequired,
        downPaymentShortfall,
        monthlyMortgage,
        mortgageShareOfIncome,
        monthlyRent,
        annualRate,
        approvalLikely,
        creditRecord,
      } = result.outcome;
      const pct = Math.round(mortgageShareOfIncome * 100);
      const rate = (annualRate * 100).toFixed(1);
      // Name the stand-ins before reasoning from them. "以你的收入" about a
      // default income is the exact sentence this flag exists to prevent.
      const { incomeKnown, savingsKnown, creditKnown } = result.outcome;
      const standIns = [
        incomeKnown !== true && "收入",
        savingsKnown !== true && "存款",
        creditKnown !== true && "信用記錄",
      ].filter(Boolean);
      const caveat =
        standIns.length > 0
          ? `先說明：這次的${standIns.join("、")}用的是預設值，不是你自己跑出來的數字。`
          : "";

      if (choice === "buy" && !canCoverDownPayment) {
        return `${caveat}頭期款要 ${nt(downPaymentRequired)}，你目前手上還差 ${nt(downPaymentShortfall)}。這不是「買不起房子」，是「現在還不到時候」——差別很重要。能改變這個數字的是存款累積的速度，而不是房價會不會跌。回頭看存錢線那條曲線，會比盯著房市有用得多。這只是模擬練習，不是真的財務建議。`;
      }
      if (choice === "buy" && !approvalLikely) {
        return `${caveat}你付得出頭期款，但月付 ${nt(monthlyMortgage)} 佔了收入的 ${pct}%${creditRecord === "poor" ? "，而且你的信用記錄會讓銀行猶豫" : ""}。銀行看的不只是你想不想買，還有這筆錢還得動嗎。信用記錄是幾年前的繳款習慣累積出來的，不是申請貸款當天才決定的——信用線那三期帳單，影響的就是這裡。這只是模擬練習，不是真的財務建議。`;
      }
      if (choice === "buy") {
        return `${caveat}以你的收入和 ${rate}% 的利率，月付大約 ${nt(monthlyMortgage)}，佔收入 ${pct}%。${verdict === "stretched" ? "數字上過得去，但這個比例會讓你之後幾年幾乎沒有轉圜空間——失業、生病或想換工作時，房貸不會跟著暫停。" : "這個比例留了餘裕，代表你還有應付意外的空間。"}買房不是終點，是一筆綁三十年的現金流承諾。這只是模擬練習，不是真的財務建議。`;
      }
      return `${caveat}你選擇租屋，月租 ${nt(monthlyRent)}。租屋常被說成「幫房東繳房貸」，但那句話漏掉了兩件事：你保留了搬家與換工作的彈性，而且頭期款那筆錢還在你手上，可以繼續增值。${canCoverDownPayment ? "你其實付得出頭期款——選擇不買，是一個判斷，不是沒得選。" : "等存款追上頭期款，你就有兩個選項可以比，而不是只有一個。"}這只是模擬練習，不是真的財務建議。`;
    }
  }
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

    // Keyed on kind, not slug: 投資線 now has two shapes (the custom
    // simulator and the TWSE reflection), and only the first can be rebuilt
    // this way. The starting sum is read back from the stored row rather than
    // left to default — computeInvesting() falls back to NT$50,000 without
    // it, so the coach was describing a NT$50,000 investment to a student
    // whose run had used their real savings.
    const stored = readStoredResult(run.kind, run.outcome_summary);
    if (
      stored?.kind === "touzi_investing_v1" &&
      isInvestChoiceId(choices.choice)
    ) {
      const outcome = computeInvesting({
        choice: choices.choice,
        ipo: Boolean(choices.ipo),
        start: stored.outcome.start,
      });
      return await generateCoachMessageViaOpenRouter(
        INVESTING_SYSTEM_PROMPT,
        buildInvestingCoachUserMessage(outcome),
      );
    }
  } catch {
    // The LLM path exists for this line but is unconfigured or failed. The
    // deterministic coach is the fallback, in every environment: it is
    // grounded in the run's own figures and contract-checked, and a student
    // with no coach at all is a worse outcome than a student with a
    // deterministic one. The response says which it was (`stub`), and the
    // panel labels it honestly.
    return { message: lineStub(run), stub: true };
  }

  // No LLM path exists for this line. Until now this threw, which the panel
  // rendered as 「AI 教練尚未設定（需要 Anthropic API 金鑰）」 — false, since no
  // key would have changed it — for nine of twelve lines in production.
  return { message: lineStub(run), stub: true };
}
