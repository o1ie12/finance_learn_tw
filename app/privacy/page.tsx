import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "起點如何收集、使用、保存與保護您的資訊。",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
        隱私權政策
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        起點隱私權政策
      </h1>
      <p className="mt-3 text-sm text-ink-faint">最後更新日期：2026 年 8 月</p>

      <div className="mt-8 space-y-8 text-[16px] leading-[1.85] text-ink/90">
        <p>
          起點（Qidian，以下稱「起點」或「我們」）是由兩位台灣高中生共同創辦的免費理財教育平台。我們非常重視使用者的隱私，尤其考量到我們的主要使用族群是未成年的高中生。本隱私權政策說明我們如何收集、使用、保存與保護您的資訊。
        </p>

        <section aria-labelledby="p-1">
          <h2 id="p-1" className="text-xl font-bold text-ink">
            一、我們收集哪些資訊
          </h2>
          <div className="mt-3 space-y-4">
            <p>
              <strong className="font-bold text-ink">
                1. 基本使用方式：不需帳號
              </strong>{" "}
              起點的核心設計是「不需要帳號」。您只需要一組系統自動產生的六碼代碼，就能開始使用並保留學習進度。我們不會要求您提供真實姓名、電話號碼、身分證字號或任何金融帳戶資訊。
            </p>
            <p>
              <strong className="font-bold text-ink">
                2. 選擇性功能：Google 登入
              </strong>{" "}
              如果您選擇使用「Google
              登入」功能（此功能為選擇性，非必要，用途是讓您能在多個裝置間同步進度），我們會透過
              Google
              取得以下資訊：您的
              Google
              帳號電子郵件地址、您的基本
              Google
              個人資料（如顯示名稱）。我們只會請求登入所需的最小權限，不會取得您
              Google
              帳號中的其他資料，例如通訊錄、雲端硬碟或日曆。
            </p>
            <p>
              <strong className="font-bold text-ink">3. 學習進度資料</strong>{" "}
              我們會記錄與您的六碼代碼綁定的學習進度，包括：已完成的站點、模擬結果、測驗分數、累積點數與戳章。這些資料用於讓您在返回平台時能接續學習進度。
            </p>
            <p>
              <strong className="font-bold text-ink">4. AI 教練功能</strong>{" "}
              部分路線（起薪線、存錢線、信用線、投資線）提供
              AI
              教練互動功能。當您使用這項功能時，您輸入的內容會被傳送至第三方
              AI
              服務供應商進行處理，以產生回應。請不要在
              AI
              教練對話中輸入真實的個人身分資訊或真實財務帳戶資訊——所有情境都是虛構練習情境。
            </p>
            <p>
              <strong className="font-bold text-ink">5. 技術性資料</strong>{" "}
              為了維持網站正常運作，我們可能會自動收集基本的技術性資料，例如瀏覽器類型、裝置類型與造訪頁面。
            </p>
          </div>
        </section>

        <section aria-labelledby="p-2">
          <h2 id="p-2" className="text-xl font-bold text-ink">
            二、我們如何使用您的資訊
          </h2>
          <ul className="mt-3 space-y-2 pl-1">
            {[
              "提供並維持您的學習進度",
              "讓您能在多個裝置間同步（僅限您主動選擇使用 Google 登入時）",
              "改善平台內容與功能",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            我們不會將您的個人資訊出售給第三方。我們不會使用您的資訊投放廣告——起點沒有廣告。
          </p>
        </section>

        <section aria-labelledby="p-3">
          <h2 id="p-3" className="text-xl font-bold text-ink">
            三、資訊分享對象（第三方服務）
          </h2>
          <p className="mt-3">
            起點使用以下第三方服務來營運平台，這些服務可能會處理您的部分資料：
          </p>
          <ul className="mt-3 space-y-2 pl-1">
            {[
              "Supabase（資料庫與後端服務）",
              "Vercel（網站託管）",
              "Google（選擇性登入功能）",
              "Anthropic 及透過 OpenRouter 串接的模型供應商（AI 教練功能）",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            這些服務供應商僅能依據其各自的隱私權政策及我們的指示處理資料，不會將您的資料用於其他目的。
          </p>
        </section>

        <section aria-labelledby="p-4">
          <h2 id="p-4" className="text-xl font-bold text-ink">
            四、未成年使用者
          </h2>
          <p className="mt-3">
            我們了解起點的主要使用族群包含未成年人。因此，我們在設計上刻意將資料收集降到最低——預設不需要任何真實個人資訊即可使用完整功能。選擇性的
            Google
            登入功能，建議未滿一定年齡的使用者在家長或監護人的知情下使用。
          </p>
        </section>

        <section aria-labelledby="p-5">
          <h2 id="p-5" className="text-xl font-bold text-ink">
            五、資料保存與刪除
          </h2>
          <p className="mt-3">
            您的學習進度會保存在與您的六碼代碼綁定的帳戶中。如果您想要刪除您的資料，請透過下方聯絡信箱與我們聯繫，我們會在合理時間內處理您的請求。
          </p>
        </section>

        <section aria-labelledby="p-6">
          <h2 id="p-6" className="text-xl font-bold text-ink">
            六、資料安全
          </h2>
          <p className="mt-3">
            我們採取合理的技術與管理措施保護您的資料，但無法保證絕對的資料安全。若發生資料外洩等事件，我們會依法通知受影響的使用者。
          </p>
        </section>

        <section aria-labelledby="p-7">
          <h2 id="p-7" className="text-xl font-bold text-ink">
            七、您的權利
          </h2>
          <p className="mt-3">
            依據個人資料保護法，您有權查詢、複製、更正、刪除您的個人資料，或請求停止處理您的個人資料。如需行使上述權利，請透過下方聯絡信箱與我們聯繫。
          </p>
        </section>

        <section aria-labelledby="p-8">
          <h2 id="p-8" className="text-xl font-bold text-ink">
            八、政策修改
          </h2>
          <p className="mt-3">
            我們可能會不時更新本隱私權政策。重大修改時，我們會在平台上公告。建議您定期查看本頁面以了解最新內容。
          </p>
        </section>

        <section aria-labelledby="p-9">
          <h2 id="p-9" className="text-xl font-bold text-ink">
            九、聯絡我們
          </h2>
          <p className="mt-3">
            如對本隱私權政策有任何問題，歡迎透過以下方式聯繫我們：
            <br />
            電子郵件：
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-line-2 underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-ink-faint">
        另見{" "}
        <Link href="/terms" className="font-medium text-line-2 underline">
          服務條款
        </Link>
        。
      </p>
    </div>
  );
}
