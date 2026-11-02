import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accountTypeLabel, assetTypeLabel } from "@/lib/domain/labels";

export async function loadHomeDashboard() {
  const session = await auth();
  const user = session?.user;
  const userId = user!.id;

  const [accounts, assets, transactions] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    prisma.asset.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: 5,
      include: { category: true, account: true },
    }),
  ]);

  const accountsTotal = accounts.reduce((sum, acc) => {
    if (acc.type === "CREDIT") {
      return sum - acc.balance;
    }
    return sum + acc.balance;
  }, 0);

  const assetsTotal = assets.reduce((sum, asset) => {
    const price = asset.marketPrice || asset.costPrice || 0;
    return sum + asset.quantity * price;
  }, 0);
  const totalWealth = accountsTotal + assetsTotal;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const accountTypeMap: Record<string, number> = {};
  accounts.forEach((acc) => {
    if (acc.type === "CREDIT" && acc.balance > 0) return;

    const typeName = accountTypeLabel(acc.type);
    accountTypeMap[typeName] = (accountTypeMap[typeName] || 0) + acc.balance;
  });

  const assetTypeMap: Record<string, number> = {};
  assets.forEach((asset) => {
    const typeName = assetTypeLabel(asset.type);
    const value = asset.quantity * (asset.marketPrice || asset.costPrice || 0);
    assetTypeMap[typeName] = (assetTypeMap[typeName] || 0) + value;
  });

  const chartData = [
    ...Object.entries(accountTypeMap).map(([name, value]) => ({ name, value })),
    ...Object.entries(assetTypeMap).map(([name, value]) => ({ name, value })),
  ].filter((item) => item.value > 0);

  return {
    user,
    totalWealth,
    monthlyIncome,
    monthlyExpense,
    transactions,
    chartData,
  };
}
