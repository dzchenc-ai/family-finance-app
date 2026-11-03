import { format } from "date-fns";
import * as XLSX from "xlsx";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildTransactionWhere,
  findTransactionsForExport,
  type SearchParams,
} from "@/lib/domain/transactions";

export async function exportTransactionsWorkbook(searchParams: SearchParams) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const transactions = await findTransactionsForExport(buildTransactionWhere(searchParams));

  const data = transactions.map((tx) => ({
    日期: format(new Date(tx.date), "yyyy-MM-dd HH:mm:ss"),
    类型: tx.type === "INCOME" ? "收入" : "支出",
    金额: tx.amount,
    分类: tx.category?.name || "无分类",
    账户: tx.account?.name || "未知账户",
    描述: tx.description || "",
    归属人: tx.user?.name || tx.user?.email || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  return XLSX.write(workbook, { type: "base64", bookType: "xlsx" }) as string;
}
