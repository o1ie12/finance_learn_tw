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
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const banner = errorBanner(error);

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">開始上課</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          我們只用一組代碼記住你的進度，不需要真實姓名、電話或任何金融帳號。
        </p>
      </div>
      {banner && (
        <p
          className="mb-6 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
          role="alert"
        >
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
  );
}
