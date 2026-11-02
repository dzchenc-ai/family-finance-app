"use server";

import { exportTransactionsWorkbook } from "@/lib/domain/export-transactions";
import type { SearchParams } from "@/lib/domain/transactions";

export async function exportTransactions(searchParams: SearchParams) {
  return exportTransactionsWorkbook(searchParams);
}
