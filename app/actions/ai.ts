"use server";

import { chatWithAI as runChat, type Message } from "@/lib/domain/ai/chat";
import { getAiModels as loadAiModels, testAiConnection as runTestAi } from "@/lib/domain/ai/providers";
import { testNowApiConnection as runTestNowApi } from "@/lib/domain/market/nowapi";

export type { Message };

export async function chatWithAI(messages: Message[]) {
  return runChat(messages);
}

export async function testNowApiConnection(appkey: string, sign: string) {
  return runTestNowApi(appkey, sign);
}

export async function testAiConnection(provider: string, apiKey: string) {
  return runTestAi(provider, apiKey);
}

export async function getAiModels(provider: string, apiKey: string) {
  return loadAiModels(provider, apiKey);
}
