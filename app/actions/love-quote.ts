"use server";

import {
  getDailyLoveQuote as loadDailyLoveQuote,
  getLoveDays as loadLoveDays,
  refreshDailyLoveQuote as reloadDailyLoveQuote,
  type QuoteResult,
} from "@/lib/domain/quotes/daily";

export type { QuoteResult };

export async function getDailyLoveQuote(): Promise<QuoteResult> {
  return loadDailyLoveQuote();
}

export async function refreshDailyLoveQuote() {
  return reloadDailyLoveQuote();
}

export async function getLoveDays() {
  return loadLoveDays();
}
