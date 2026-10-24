import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { isGoogleAuthConfigured } from "@/lib/supabaseAuth";

export const metadata: Metadata = {
  title: "建立帳號",
  description:
    "免密碼、免 email，用一組專屬代碼開始你的理財課程與模擬，隨時回來接續進度。",
};

function errorBanner(code: string | undefined): string | null {
  switch (code) {
    case "google_failed":
      return "Google 登入沒有成功，請再試一次。";
    case "google_domain":
      return "這個 Google 帳號不屬於允許的網域，暫時無法用它登入。";
    case "google_not_configured":
      return "Google 登入尚未設定，暫時無法使用。";
    case "google_session_expired":
      return "驗證已過期，請重新用 Google 登入一次。";
    case "not_signed_in":
      return "連結 Google 帳號前，請先用代碼登入。";
    case "backend_not_configured":
      return "系統的資料庫尚未設定，暫時無法使用。";
    case "server_error":
      return "發生了一點問題，請再試一次。";
    default:
      return null;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tap?: string }>;
}) {
  const { error, tap } = await searchParams;
  const banner = errorBanner(error);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 -top-60 h-[700px] w-[700px] rounded-full bg-[#d7e7f6] opacity-80 blur-[140px]"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-14">
        <div className="flex flex-col gap-5">
          {tap ? (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 items-center rounded-lg bg-[#3ddc84] px-2.5 text-[13px] font-extrabold tracking-[0.06em] text-[#0b3b22]">
                ✓ 已感應
              </span>
              <span className="text-sm text-ink-soft">嗶！最後一步</span>
            </div>
          ) : null}
          <h1 className="text-5xl font-black leading-[1.08] tracking-[-0.02em] sm:text-[64px]">
            拿一張
            <br />
            學習卡。
          </h1>
          <p className="max-w-[460px] text-lg leading-[1.75] text-ink-soft">
            只需要暱稱，學校選填。建立後你會拿到一組 6 碼代碼，換手機或電腦都用它登入。不收真實姓名、電話或金融帳號，也不用 email 或密碼。
          </p>
          <div
            aria-hidden="true"
            className="mt-2 hidden h-[188px] w-[300px] -rotate-[4deg] overflow-hidden rounded-[22px] bg-[#14171a] shadow-[0_30px_60px_rgba(20,23,26,.3)] lg:block"
          >
            <div className="h-2.5" style={{ background: "var(--stripe)" }} />
            <div className="flex flex-col gap-1.5 px-6 py-[22px] text-white">
              <span className="text-[22px] font-black tracking-[0.04em]">錢途 學習卡</span>
              <span className="text-[11px] tracking-[0.16em] text-[#8792a0]">FINLINE · STUDENT</span>
              <span className="mt-[26px] text-[22px] font-bold tracking-[0.3em] text-[#ffb81c]">• • • • • •</span>
            </div>
          </div>
        </div>
        <div>
          {banner && (
            <p className="mb-6 rounded-2xl bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
              {banner}
            </p>
          )}
          <SignupForm />
          {isGoogleAuthConfigured() && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
                <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
                或
                <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
              </div>
              <GoogleSignInButton intent="signin" />
            </>
          )}
          <p className="mt-6 text-center text-xs text-ink-faint">
            建立帳號即代表您同意
            <Link href="/terms" className="underline hover:text-ink">
              《服務條款》
            </Link>
            與
            <Link href="/privacy" className="underline hover:text-ink">
              《隱私權政策》
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
