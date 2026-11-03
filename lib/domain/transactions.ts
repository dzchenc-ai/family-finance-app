import { Prisma } from "@prisma/client";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SearchParams = { [key: string]: string | string[] | undefined };

export function buildTransactionWhere(searchParams: SearchParams): Prisma.TransactionWhereInput {
  const { search, type, categoryId, accountId, startDate, endDate } = searchParams;
  const where: Prisma.TransactionWhereInput = {};

  if (search && typeof search === "string") {
    where.OR = [{ description: { contains: search } }];
  }

  if (type && typeof type === "string") {
    where.type = type;
  }

  if (categoryId && typeof categoryId === "string") {
    where.categoryId = categoryId;
  }

  if (accountId && typeof accountId === "string") {
    where.accountId = accountId;
  }

  if (startDate && typeof startDate === "string") {
    const dateFilter = (where.date as Prisma.DateTimeFilter) || {};
    where.date = { ...dateFilter, gte: new Date(startDate) };
  }

  if (endDate && typeof endDate === "string") {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const dateFilter = (where.date as Prisma.DateTimeFilter) || {};
    where.date = { ...dateFilter, lte: end };
  }

  return where;
}

export async function sumTransactionsByType(where: Prisma.TransactionWhereInput) {
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where,
    _sum: { amount: true },
  });

  return {
    income: rows.find((s) => s.type === "INCOME")?._sum.amount || 0,
    expense: rows.find((s) => s.type === "EXPENSE")?._sum.amount || 0,
  };
}

function calculateGrowth(current: number, last: number) {
  if (last === 0) return current > 0 ? 100 : 0;
  return ((current - last) / last) * 100;
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
  });
}

export async function findTransactionsForExport(where: Prisma.TransactionWhereInput) {
  return prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      category: true,
      account: true,
      user: true,
    },
  });
}

export type TransactionWriteInput = {
  amount: number;
  type: string;
  description: string;
  categoryId: string | null;
  accountId: string;
  date: Date;
  userId: string;
};

export async function createTransactionRecord(input: TransactionWriteInput) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          amount: input.amount,
          type: input.type,
          description: input.description,
          date: input.date,
          categoryId: input.categoryId,
          accountId: input.accountId,
          userId: input.userId,
        },
      });

      const account = await tx.account.findUnique({ where: { id: input.accountId } });
      if (account) {
        let newBalance = account.balance;
        if (input.type === "INCOME") {
          newBalance += input.amount;
        } else if (input.type === "EXPENSE") {
          newBalance -= input.amount;
        }

        await tx.account.update({
          where: { id: input.accountId },
          data: { balance: newBalance },
        });
      }
    });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw new Error("Failed to create transaction");
  }
}

export async function updateTransactionRecord(
  id: string,
  input: Omit<TransactionWriteInput, "userId">,
) {
  try {
    await prisma.$transaction(async (tx) => {
      const oldTransaction = await tx.transaction.findUnique({
        where: { id },
        include: { account: true },
      });

      if (!oldTransaction) throw new Error("Transaction not found");

      if (oldTransaction.accountId) {
        const oldAccount = await tx.account.findUnique({ where: { id: oldTransaction.accountId } });
        if (oldAccount) {
          let revertedBalance = oldAccount.balance;
          if (oldTransaction.type === "INCOME") {
            revertedBalance -= oldTransaction.amount;
          } else {
            revertedBalance += oldTransaction.amount;
          }
          await tx.account.update({
            where: { id: oldTransaction.accountId },
            data: { balance: revertedBalance },
          });
        }
      }

      await tx.transaction.update({
        where: { id },
        data: {
          amount: input.amount,
          type: input.type,
          description: input.description,
          date: input.date,
          categoryId: input.categoryId,
          accountId: input.accountId,
        },
      });

      const newAccount = await tx.account.findUnique({ where: { id: input.accountId } });
      if (newAccount) {
        let newBalance = newAccount.balance;
        if (input.type === "INCOME") {
          newBalance += input.amount;
        } else {
          newBalance -= input.amount;
        }
        await tx.account.update({
          where: { id: input.accountId },
          data: { balance: newBalance },
        });
      }
    });
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw new Error("Failed to update transaction");
  }
}

export async function deleteTransactionRecords(ids: string[]) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        const transaction = await tx.transaction.findUnique({
          where: { id },
        });

        if (!transaction) continue;

        if (transaction.accountId) {
          const account = await tx.account.findUnique({ where: { id: transaction.accountId } });
          if (account) {
            let newBalance = account.balance;
            if (transaction.type === "INCOME") {
              newBalance -= transaction.amount;
            } else {
              newBalance += transaction.amount;
            }
            await tx.account.update({
              where: { id: transaction.accountId },
              data: { balance: newBalance },
            });
          }
        }

        await tx.transaction.delete({ where: { id } });
      }
    });
  } catch (error) {
    console.error("Failed to delete transactions:", error);
    throw new Error("Failed to delete transactions");
  }
}

export async function loadTransactionsPage(searchParams: SearchParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return null;
  }

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 100;
  const skip = (page - 1) * pageSize;

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [currentMonth, lastMonth] = await Promise.all([
    sumTransactionsByType({
      date: { gte: currentMonthStart, lte: currentMonthEnd },
    }),
    sumTransactionsByType({
      date: { gte: lastMonthStart, lte: lastMonthEnd },
    }),
  ]);

  const incomeGrowth = calculateGrowth(currentMonth.income, lastMonth.income);
  const expenseGrowth = calculateGrowth(currentMonth.expense, lastMonth.expense);

  const where = buildTransactionWhere(searchParams);

  const [transactions, totalCount, categories, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        category: true,
        account: true,
        user: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
    prisma.category.findMany(),
    prisma.account.findMany(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const oneYearAgo = new Date();
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
  oneYearAgo.setDate(1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const statsTransactions = await prisma.transaction.findMany({
    where: {
      date: { gte: oneYearAgo },
    },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const monthlyMap = new Map<string, { income: number; expense: number }>();
  const categoryMap = new Map<string, number>();

  statsTransactions.forEach((tx) => {
    const date = new Date(tx.date);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyMap.has(monthStr)) {
      monthlyMap.set(monthStr, { income: 0, expense: 0 });
    }
    const monthData = monthlyMap.get(monthStr)!;
    if (tx.type === "INCOME") {
      monthData.income += tx.amount;
    } else if (tx.type === "EXPENSE") {
      monthData.expense += tx.amount;
    }

    if (tx.categoryId && tx.category) {
      const userName = tx.user?.name || tx.user?.email || "Unknown";
      const key = `${monthStr}|${tx.categoryId}|${tx.category.name}|${tx.type}|${tx.userId}|${userName}`;
      const currentAmount = categoryMap.get(key) || 0;
      categoryMap.set(key, currentAmount + tx.amount);
    }
  });

  const monthlyStats = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const categoryStats = Array.from(categoryMap.entries()).map(([key, amount]) => {
    const [month, categoryId, categoryName, type, userId, userName] = key.split("|");
    return {
      month,
      categoryId,
      categoryName,
      type,
      userId,
      userName,
      amount,
    };
  });

  return {
    page,
    pageSize,
    totalPages,
    totalCount,
    currentIncome: currentMonth.income,
    currentExpense: currentMonth.expense,
    incomeGrowth,
    expenseGrowth,
    transactions,
    categories,
    accounts,
    monthlyStats,
    categoryStats,
  };
}
