"use server";

import { fetchGoldPrice } from "@/lib/domain/market/gold";

export async function getGoldPrice() {
  return fetchGoldPrice();
}
