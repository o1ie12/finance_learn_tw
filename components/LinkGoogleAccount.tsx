import { isGoogleAuthConfigured } from "@/lib/supabaseAuth";

/**
 * Dashboard/settings block for existing code-based students: shows the
 * linked state, or an explicit "link my account" action. Never triggered
 * implicitly — the student has to click through to Google themselves.
 */
export default function LinkGoogleAccount({
  googleEmail,
  feedback,
}: {
  googleEmail: string | null;
  feedback?: "linked" | "already_used";
}) {
  if (!isGoogleAuthConfigured()) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {feedback === "linked" && (
        <p
          className="w-full rounded-lg bg-positive/10 px-3.5 py-2 text-sm text-positive"
          role="status"
        >
          已成功連結 Google 帳號。
        </p>
      )}
      {feedback === "already_used" && (
        <p
          className="w-full rounded-lg bg-negative/10 px-3.5 py-2 text-sm text-negative"
          role="alert"
        >
          這個 Google 帳號已經連結到另一組代碼了。
        </p>
      )}
      {googleEmail ? (
        <span className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink-soft">
          已連結 Google（{googleEmail}）
        </span>
      ) : (
        <a
          href="/api/auth/google/start?intent=link"
          className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink"
        >
          連結 Google 帳號
        </a>
      )}
    </div>
  );
}
