import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "建立帳號",
  description:
    "免密碼、免 email，用一組專屬代碼開始你的理財課程與模擬，隨時回來接續進度。",
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">開始上課</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          我們只用一組代碼記住你的進度，不需要真實姓名、電話或任何金融帳號。
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
