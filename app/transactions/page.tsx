import Link from "next/link";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { StatisticsDashboard } from "@/components/statistics/statistics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/transactions/export-button";
import { loadTransactionsPage } from "@/lib/domain/transactions";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await loadTransactionsPage(searchParams);
  if (!data) {
    redirect("/login");
  }

  const { view } = searchParams;
  const {
    currentExpense,
    currentIncome,
    expenseGrowth,
    incomeGrowth,
    transactions,
    page,
    pageSize,
    totalPages,
    totalCount,
    categories,
    accounts,
    monthlyStats,
    categoryStats,
  } = data;

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">流水</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">家庭账本</h1>
          <p className="mt-1 text-sm text-muted-foreground">收入、支出和转账都记在这里</p>
        </div>
        <div className="flex gap-2">
          <ExportButton />
          <Link href="/transactions/create">
            <Button>
              <Plus className="h-4 w-4" /> 记一笔
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue={view === "statistics" ? "statistics" : "list"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">交易列表</TabsTrigger>
          <TabsTrigger value="statistics">统计分析</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-8">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-xs text-muted-foreground">本月支出</p>
                  <p className="money mt-2 text-3xl text-expense">
                    ¥{currentExpense.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <GrowthChip value={expenseGrowth} upIsExpense />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-xs text-muted-foreground">本月收入</p>
                  <p className="money mt-2 text-3xl text-income">
                    ¥{currentIncome.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <GrowthChip value={incomeGrowth} />
              </CardContent>
            </Card>
          </div>

          <TransactionFilters categories={categories} accounts={accounts} />

          <Card>
            <TransactionList
              transactions={transactions}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalCount={totalCount}
            />
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsDashboard monthlyStats={monthlyStats} categoryStats={categoryStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GrowthChip({ value, upIsExpense = false }: { value: number; upIsExpense?: boolean }) {
  const up = value > 0;
  const tone = up === upIsExpense ? "text-expense" : "text-income";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs ${tone}`}>
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}%
      <span className="text-muted-foreground">环比</span>
    </span>
  );
}
