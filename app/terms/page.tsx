import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "服務條款",
  description: "使用起點平台前，請詳細閱讀本服務條款。",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
        服務條款
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        起點服務條款
      </h1>
      <p className="mt-3 text-sm text-ink-faint">最後更新日期：2026 年 8 月</p>

      <div className="mt-8 space-y-8 text-[16px] leading-[1.85] text-ink/90">
        <p>
          歡迎使用起點！請在使用本平台前詳細閱讀以下服務條款。使用起點即表示您同意本服務條款的所有內容。
        </p>

        <section aria-labelledby="t-1">
          <h2 id="t-1" className="text-xl font-bold text-ink">
            一、服務說明
          </h2>
          <p className="mt-3">
            起點是一個免費的理財教育平台，專為台灣高中生設計。平台內容包含文章課程、互動測驗與情境模擬，用途為財金知識教育，幫助使用者練習理財決策。
          </p>
        </section>

        <section aria-labelledby="t-2">
          <h2 id="t-2" className="text-xl font-bold text-ink">
            二、非投資或財務建議
          </h2>
          <p className="mt-3">
            起點平台上的所有內容、數字、情境與模擬結果，僅供教學用途，不構成、也不應被視為個人化的投資建議、財務規劃建議或任何形式的專業意見。平台內的「歷史回放投資模擬」功能使用真實歷史市場資料進行教學情境練習，但模擬結果不代表也不保證未來實際投資表現。做任何真實的財務或投資決定前，請諮詢合格的專業人士。
          </p>
        </section>

        <section aria-labelledby="t-3">
          <h2 id="t-3" className="text-xl font-bold text-ink">
            三、AI 生成內容之限制
          </h2>
          <p className="mt-3">
            部分路線提供的「AI 教練」功能，其回應由第三方 AI
            模型即時生成。AI
            生成的內容可能包含錯誤、不準確或過時的資訊，不構成專業建議。使用者應自行判斷並查證重要資訊，不應完全依賴
            AI 教練的回應做出實際決定。
          </p>
        </section>

        <section aria-labelledby="t-4">
          <h2 id="t-4" className="text-xl font-bold text-ink">
            四、使用資格
          </h2>
          <p className="mt-3">
            起點主要設計給台灣高中階段的學生使用。若您未滿一定年齡（依台灣法律規定），建議您在家長或監護人的同意與陪同下使用本平台。
          </p>
        </section>

        <section aria-labelledby="t-5">
          <h2 id="t-5" className="text-xl font-bold text-ink">
            五、帳戶與代碼
          </h2>
          <p className="mt-3">
            起點使用系統自動產生的六碼代碼作為識別方式，不需要註冊真實身分資訊。您有責任妥善保管您的代碼；如代碼遺失，您可能無法復原先前的學習進度，除非您已啟用
            Google 登入同步。請勿嘗試取得或使用非您本人的代碼。
          </p>
        </section>

        <section aria-labelledby="t-6">
          <h2 id="t-6" className="text-xl font-bold text-ink">
            六、使用者行為規範
          </h2>
          <p className="mt-3">使用起點時，您同意不會：</p>
          <ul className="mt-3 space-y-2 pl-1">
            {[
              "嘗試干擾、破壞或未經授權存取平台系統",
              "以任何自動化方式大量存取或擷取平台內容",
              "利用平台從事任何違法行為",
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
        </section>

        <section aria-labelledby="t-7">
          <h2 id="t-7" className="text-xl font-bold text-ink">
            七、智慧財產權
          </h2>
          <p className="mt-3">
            起點平台上的所有內容（包含文章、圖像、程式碼、設計）皆為起點團隊或其授權來源所有，受著作權法保護。未經授權，請勿重製、散布或用於商業用途。
          </p>
        </section>

        <section aria-labelledby="t-8">
          <h2 id="t-8" className="text-xl font-bold text-ink">
            八、服務變動與中止
          </h2>
          <p className="mt-3">
            我們保留隨時修改、暫停或終止本服務（或其部分功能）的權利，恕不另行通知。我們也保留在使用者違反本服務條款時，限制或終止其存取權限的權利。
          </p>
        </section>

        <section aria-labelledby="t-9">
          <h2 id="t-9" className="text-xl font-bold text-ink">
            九、免責聲明與責任限制
          </h2>
          <p className="mt-3">
            起點是由學生團隊開發、免費提供的教育平台，依「現況」提供，不保證內容完全無誤或服務不會中斷。在法律允許的最大範圍內，起點團隊不對因使用（或無法使用）本平台所產生的任何直接或間接損失負責。
          </p>
        </section>

        <section aria-labelledby="t-10">
          <h2 id="t-10" className="text-xl font-bold text-ink">
            十、準據法
          </h2>
          <p className="mt-3">本服務條款依中華民國法律解釋與適用。</p>
        </section>

        <section aria-labelledby="t-11">
          <h2 id="t-11" className="text-xl font-bold text-ink">
            十一、條款修改
          </h2>
          <p className="mt-3">
            我們可能會不時更新本服務條款。重大修改時，我們會在平台上公告。持續使用起點即表示您同意經修改後的條款。
          </p>
        </section>

        <section aria-labelledby="t-12">
          <h2 id="t-12" className="text-xl font-bold text-ink">
            十二、聯絡我們
          </h2>
          <p className="mt-3">
            如對本服務條款有任何問題，歡迎透過以下方式聯繫我們：
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
        <Link href="/privacy" className="font-medium text-line-2 underline">
          隱私權政策
        </Link>
        。
      </p>
    </div>
  );
}
