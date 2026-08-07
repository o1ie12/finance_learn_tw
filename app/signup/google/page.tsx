import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyPendingGoogleIdentity } from "@/lib/googleAccount";
import { PENDING_GOOGLE_COOKIE } from "@/lib/session";
import GoogleChoiceForms from "@/components/GoogleChoiceForms";

export const metadata: Metadata = {
  title: "連結你的帳號",
  description: "用 Google 帳號登入後，選擇連結舊進度或建立新帳號。",
};

export default async function GoogleChoicePage() {
  const store = await cookies();
  const pending = verifyPendingGoogleIdentity(store.get(PENDING_GOOGLE_COOKIE)?.value);
  if (!pending) {
    redirect("/signup?error=google_session_expired");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">快好了</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          已經用 Google 帳號（{pending.google_email}）完成登入，但我們還沒看過這個帳號。
        </p>
      </div>
      <GoogleChoiceForms />
    </div>
  );
}
