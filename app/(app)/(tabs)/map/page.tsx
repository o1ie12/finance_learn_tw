import type { Metadata } from "next";
import { Body, Card } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { TopBar } from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "路線" };

/** 06 E8.7. Built after STOP 1; until then this tab points to the current page. */
export default function Page() {
  return (
    <>
      <TopBar title="路線" flat />
      <div style={{ padding: "var(--s-4) var(--gutter)" }}>
        <Card>
          <Body>這一頁正在重新設計，目前的內容在首頁。</Body>
          <div style={{ marginTop: "var(--s-4)" }}>
            <Button variant="secondary" href="/dashboard">
              前往首頁
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
