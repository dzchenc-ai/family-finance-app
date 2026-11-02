"use server";

import { fetchStockPrice } from "@/lib/domain/market/stock";

export async function getStockPrice(symbol: string) {
  return fetchStockPrice(symbol);
}
