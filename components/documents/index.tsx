/**
 * Documents (01 §8, 03 §1 `Material`): one component per material kind and
 * `renderMaterial`, the switch the task engine uses. Client-safe: nothing
 * here imports the price seed (see priceSeries.ts for the server helper).
 */

import type { ReactNode } from "react";
import { LEASE_CLAUSES } from "@/lib/sims/leaseContract";
import type { Material } from "@/lib/tasks/types";
import BillSheet from "./BillSheet";
import CardStatement from "./CardStatement";
import ChatThread from "./ChatThread";
import CreditReport from "./CreditReport";
import LeaseDoc from "./LeaseDoc";
import Ledger, { type LedgerInputs } from "./Ledger";
import NewsCard from "./NewsCard";
import Payslip from "./Payslip";
import Policy from "./Policy";
import PriceChart from "./PriceChart";
import Snapshot from "./Snapshot";
import type { DocumentProps } from "./fields";

export { default as DocumentFrame } from "./DocumentFrame";
export { BillSheet, CardStatement, ChatThread, CreditReport, LeaseDoc, Ledger, NewsCard, Payslip, Policy, PriceChart, Snapshot };
export type { CellState, LedgerInputs } from "./Ledger";
export type { DocumentProps, FindMode } from "./fields";
export { statementTotal } from "./CardStatement";

export interface RenderMaterialOpts extends DocumentProps {
  /** Ledger blank-cell inputs (only used by `ledger`). */
  ledger?: LedgerInputs;
}

function assertNever(x: never): never {
  throw new Error(`Unknown material kind: ${JSON.stringify(x)}`);
}

export function renderMaterial(material: Material, opts: RenderMaterialOpts = {}): ReactNode {
  const { ledger, ...doc } = opts;
  switch (material.kind) {
    case "payslip":
      return <Payslip data={material.data} {...doc} />;
    case "cardStatement":
      return <CardStatement data={material.data} {...doc} />;
    case "creditReport":
      return <CreditReport data={material.data} {...doc} />;
    case "chat":
      return <ChatThread data={material.data} {...doc} />;
    case "billSheet":
      return <BillSheet data={material.data} {...doc} />;
    case "ledger":
      return <Ledger data={material.data} inputs={ledger} {...doc} />;
    case "policy":
      return <Policy data={material.data} {...doc} />;
    case "lease":
      return <LeaseDoc data={material.data} {...doc} />;
    case "snapshot":
      return <Snapshot data={material.data} {...doc} />;
    case "priceChart":
      return <PriceChart data={material.data} {...doc} />;
    case "newsCard":
      return <NewsCard data={material.data} {...doc} />;
    default:
      return assertNever(material);
  }
}

/** A short name for a material (viewer buttons, modal titles). */
export function materialTitle(material: Material): string {
  switch (material.kind) {
    case "payslip":
      return `薪資單：${material.data.company}`;
    case "cardStatement":
      return `信用卡帳單：${material.data.bank}`;
    case "creditReport":
      return `信用報告：${material.data.name}`;
    case "chat":
      return material.data.mode === "call"
        ? `通話紀錄：${material.data.contact}`
        : `聊天訊息：${material.data.contact}`;
    case "billSheet":
      return material.data.title;
    case "ledger":
      return "記帳表";
    case "policy":
      return `保單摘要：${material.data.type}`;
    case "lease":
      return "住宅租賃契約";
    case "snapshot":
      return material.data.name;
    case "priceChart":
      return material.data.title;
    case "newsCard":
      return `新聞：${material.data.headline}`;
    default:
      return assertNever(material);
  }
}

/**
 * Every field id a material exposes in find mode, in reading order. Lets a
 * content check confirm that a FindStep's targets exist.
 */
export function materialFieldIds(material: Material): string[] {
  const idx = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}:${i}`);
  switch (material.kind) {
    case "payslip":
      return ["company", "month", "base", "overtime", "gross", "labor", "health", "pension", "net"];
    case "cardStatement":
      return [
        "bank",
        "month",
        "totalDue",
        "minimumDue",
        "dueDate",
        "closingDate",
        "limit",
        "interest",
        "col:date",
        "col:postDate",
        "col:desc",
        "col:amount",
        ...idx("tx", material.data.transactions.length),
      ];
    case "creditReport":
      return [
        "score",
        "application",
        "name",
        "age",
        "job",
        "income",
        "tenure",
        "cards.count",
        "cards.utilization",
        "cards.late12",
        "loans",
        "inquiries3m",
        "guarantor",
        "derogatory",
      ];
    case "chat":
      return idx("msg", material.data.messages.length);
    case "billSheet":
      return [...idx("row", material.data.rows.length), "total"];
    case "ledger":
      return idx("row", material.data.rows.length);
    case "policy":
      return [
        "insurer",
        "type",
        "premium",
        "term",
        ...idx("coverage", material.data.coverage.length),
        ...idx("exclusions", material.data.exclusions.length),
      ];
    case "lease": {
      // Same selection as LeaseDoc; ids are `clause:<clause id>`.
      const only = material.data.clauseIds;
      return LEASE_CLAUSES.filter((c) => !only?.length || only.includes(c.id)).map((c) => `clause:${c.id}`);
    }
    case "snapshot":
      return idx("row", material.data.rows.length);
    case "priceChart":
    case "newsCard":
      return [];
    default:
      return assertNever(material);
  }
}
