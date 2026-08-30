import "server-only";

/**
 * 9c — "email me my code": a lighter, stateless fallback to Google Sign-in
 * (9b). No account is created and no email is stored anywhere — this is a
 * one-off transactional send of a code the student already has, to an
 * address they type in that moment. Plain fetch against Resend's HTTP API,
 * same "no new SDK" approach as the OpenRouter coach integration in
 * lib/coach.ts. Gracefully no-ops (dev stub) when RESEND_API_KEY isn't set,
 * so local/dev-store testing doesn't require a real email provider.
 */

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Same gating pattern as isGoogleAuthConfigured() in lib/supabaseAuth.ts —
 * server components use this to decide whether to render the "email me my
 * code" entry point at all, so an unconfigured deployment shows nothing
 * rather than a button that claims success without sending anything.
 */
export function isEmailCodeConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export interface SendCodeEmailResult {
  stub: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}

export async function sendCodeEmail(
  email: string,
  code: string,
): Promise<SendCodeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    // Dev/local fallback — no email provider configured. Log so the code
    // is still visible to whoever is testing, matching the coach's
    // dev-stub pattern rather than failing the request outright.
    console.log(`[email-code stub] would send code ${code} to ${email}`);
    return { stub: true };
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "你的起點代碼",
      text: `你的起點代碼是：${code}\n\n用它在任何裝置上找回你的學習進度：${process.env.NEXT_PUBLIC_SITE_URL || "https://qidian.tw"}/dashboard\n\n這封信是你在起點主動要求寄送的，我們不會用這個信箱做其他用途，也不會儲存它。`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend request failed: ${res.status} ${detail}`);
  }

  return { stub: false };
}
