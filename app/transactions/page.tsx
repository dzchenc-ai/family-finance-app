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
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">交易记录</h1>
          <p className="text-muted-foreground mt-1">查看及管理您的所有收支明细</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <ExportButton />
          <Link href="/transactions/create">
            <Button className="gap-2 shadow-md w-full md:w-auto">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-900/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">本月支出</p>
                    <h3 className="text-2xl font-bold mt-2 text-red-700 dark:text-red-300">
                      ¥ {currentExpense.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className={`flex items-center text-sm font-medium ${expenseGrowth > 0 ? "text-red-600" : "text-green-600"} bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full`}>
                    {expenseGrowth > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(expenseGrowth).toFixed(1)}%
                    <span className="text-xs text-muted-foreground ml-1">环比</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-900/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">本月收入</p>
                    <h3 className="text-2xl font-bold mt-2 text-green-700 dark:text-green-300">
                      ¥ {currentIncome.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className={`flex items-center text-sm font-medium ${incomeGrowth > 0 ? "text-green-600" : "text-red-600"} bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full`}>
                    {incomeGrowth > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(incomeGrowth).toFixed(1)}%
                    <span className="text-xs text-muted-foreground ml-1">环比</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionFilters categories={categories} accounts={accounts} />

          <Card className="shadow-sm border-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
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
