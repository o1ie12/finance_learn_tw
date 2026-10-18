import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocumentsPreview from "@/components/documents/DocumentsPreview";
import { biggestFallWindow, preparePriceChart } from "@/components/documents/priceSeries";

// Dev-only gallery of the task documents. 404 in production.
export const metadata: Metadata = {
  title: "文件元件預覽",
  robots: { index: false, follow: false },
};

export default function DocumentsPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  // Prepared on the server: prices.ts imports the large price seed.
  const chart = preparePriceChart({
    title: "大盤 ETF（0050）",
    series: [],
    source: { ticker: "0050", window: "biggestFall12" },
  });
  const fall = biggestFallWindow("0050");
  const pct = Math.abs(fall.change * 100).toFixed(1);
  const news = {
    headline: `台股單月重挫 ${pct}%`,
    dateLabel: `${fall.markMonth.replace("-", "/")} 月底`,
    body: `大盤 ETF 這個月跌了 ${pct}%。不少人開始想要不要先賣掉。`,
  };

  return <DocumentsPreview chart={chart} news={news} />;
}
