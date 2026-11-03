import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSystemSettingInternal } from "@/lib/domain/system-settings";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Household-wide snapshot. User filtering was intentionally removed so the assistant can answer across the family. */
async function getFinancialContext() {
  const accounts = await prisma.account.findMany({
    select: {
      name: true,
      type: true,
      balance: true,
      currency: true,
      user: { select: { name: true } },
    },
  });

  const assets = await prisma.asset.findMany({
    select: {
      name: true,
      type: true,
      quantity: true,
      marketPrice: true,
      costPrice: true,
      symbol: true,
      user: { select: { name: true } },
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "desc" },
    take: 50,
    include: {
      category: true,
      account: true,
      user: { select: { name: true } },
    },
  });

  let context = `系统所有用户财务概况 (截至 ${new Date().toLocaleDateString()}):\n\n`;

  context += `【账户余额】:\n`;
  accounts.forEach((acc) => {
    context += `- [用户:${acc.user?.name || "未知"}] ${acc.name} (${acc.type}): ${acc.balance.toFixed(2)} ${acc.currency}\n`;
  });

  context += `\n【投资资产】:\n`;
  assets.forEach((asset) => {
    const value = (asset.marketPrice || asset.costPrice) * asset.quantity;
    const profit = asset.marketPrice ? (asset.marketPrice - asset.costPrice) * asset.quantity : 0;
    context += `- [用户:${asset.user?.name || "未知"}] ${asset.name} (${asset.type}): 市值 ${value.toFixed(2)}, 盈亏 ${profit.toFixed(2)}\n`;
  });

  context += `\n【最近交易 (近30天前50笔)】:\n`;
  transactions.forEach((t) => {
    context += `- [用户:${t.user?.name || "未知"}] ${t.date.toLocaleDateString()} | ${t.type === "EXPENSE" ? "支出" : t.type === "INCOME" ? "收入" : "转账"} | ${t.amount.toFixed(2)} | ${t.category?.name || "无分类"} | ${t.description || ""}\n`;
  });

  return context;
}

export async function chatWithAI(messages: Message[]) {
  try {
    console.log("Starting chatWithAI...");
    const user = await getCurrentUser();
    if (!user) {
      console.log("User not logged in");
      return { error: "请先登录" };
    }

    const provider = await getSystemSettingInternal("ai_provider");
    const apiKey = await getSystemSettingInternal("ai_api_key");
    const model = await getSystemSettingInternal("ai_model");

    console.log("AI Config:", { provider, model, hasKey: !!apiKey });

    if (!apiKey) {
      return { error: "管理员未配置 AI API Key，请联系管理员。" };
    }

    let financialContext = "";
    try {
      financialContext = await getFinancialContext();
    } catch (e) {
      console.error("Failed to get financial context:", e);
    }

    const systemPrompt: Message = {
      role: "system",
      content: `你是一个专业的家庭财务理财助手。以下是系统中所有用户的财务数据摘要：\n\n${financialContext}\n\n请根据这些数据回答用户的问题。数据中已标注所属用户。如果用户询问特定人的数据，请筛选回答。如果用户询问整体情况，请综合分析。请保持回答简洁、专业、客观。`,
    };

    const apiMessages = [systemPrompt, ...messages];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    let apiUrl = "";
    if (provider === "deepseek") {
      apiUrl = "https://api.deepseek.com/chat/completions";
    } else if (provider === "openrouter") {
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      headers["HTTP-Referer"] = "https://family-finance.app";
      headers["X-Title"] = "Family Finance App";
    } else {
      return { error: "不支持的 AI 服务商" };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model || "deepseek-chat",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", errorText);
      return { error: `AI 服务请求失败: ${response.statusText}` };
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "抱歉，我没有理解您的问题。";

    return { content: reply };
  } catch (error: any) {
    console.error("Chat Error:", error);
    return { error: "系统错误，请稍后再试。" };
  }
}
