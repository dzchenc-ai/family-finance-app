"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Plus, Eye, EyeOff, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetPieChart } from "@/components/home/asset-pie-chart";
import { LoveQuoteCard } from "@/components/home/love-quote-card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

interface HomeDashboardProps {
  user: any;
  totalWealth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: any[];
  chartData: { name: string; value: number }[];
}

function formatCny(value: number, hidden: boolean) {
  if (hidden) return "••••••";
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function HomeDashboard({
  user,
  totalWealth,
  monthlyIncome,
  monthlyExpense,
  transactions,
  chartData,
}: HomeDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const now = new Date();
  const net = monthlyIncome - monthlyExpense;

  return (
    <main className="page-shell">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">家庭总览</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {user?.name || "你好"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(now, "yyyy年M月d日 EEEE", { locale: zhCN })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions/create">
            <Button>
              <Plus className="h-4 w-4" /> 记一笔
            </Button>
          </Link>
          <Link href="/wealth">
            <Button variant="outline">查看资产</Button>
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl bg-primary p-6 text-primary-foreground md:p-8 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-primary-foreground/70">净资产</p>
              <p className="money mt-3 text-4xl leading-none md:text-5xl">{formatCny(totalWealth, !isVisible)}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="rounded-full p-2 text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10"
              aria-label={isVisible ? "隐藏金额" : "显示金额"}
            >
              {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-primary-foreground/15 pt-5">
            <HeroStat label="本月收入" value={formatCny(monthlyIncome, !isVisible)} />
            <HeroStat label="本月支出" value={formatCny(monthlyExpense, !isVisible)} />
            <HeroStat label="本月结余" value={formatCny(net, !isVisible)} />
          </div>
        </div>

        <div className="lg:col-span-5">
          <LoveQuoteCard />
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">最近收支</CardTitle>
              <CardDescription>最近五笔家庭流水</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                全部 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <ul className="divide-y">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          tx.type === "INCOME" ? "bg-primary/10 text-income" : "bg-destructive/10 text-expense"
                        }`}
                      >
                        {tx.type === "INCOME" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{tx.description || tx.category?.name || "未填写备注"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {format(new Date(tx.date), "M月d日 HH:mm")} · {tx.account?.name}
                        </p>
                      </div>
                    </div>
                    <span className={`money shrink-0 text-base ${tx.type === "INCOME" ? "text-income" : "text-expense"}`}>
                      {isVisible
                        ? `${tx.type === "INCOME" ? "+" : "−"}${Math.abs(tx.amount).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`
                        : "••••"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-sm text-muted-foreground">还没有收支记录</p>
                <Link href="/transactions/create" className="mt-4">
                  <Button variant="outline" size="sm">记第一笔</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">资产分布</CardTitle>
              <CardDescription>按账户与资产类型</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className={!isVisible ? "blur-md transition-all" : "transition-all"}>
                  <AssetPieChart data={chartData} />
                </div>
              ) : (
                <div className="flex h-[220px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <PieChart className="mb-3 h-5 w-5 opacity-40" />
                  添加账户或资产后，这里会显示占比
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/wealth?tab=accounts" className="rounded-xl border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent">
              <p className="font-medium">资金账户</p>
              <p className="mt-1 text-xs text-muted-foreground">现金、储蓄与负债</p>
            </Link>
            <Link href="/transactions?view=statistics" className="rounded-xl border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent">
              <p className="font-medium">收支统计</p>
              <p className="mt-1 text-xs text-muted-foreground">按月查看结余</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-primary-foreground/65">{label}</p>
      <p className="money mt-1 text-lg md:text-xl">{value}</p>
    </div>
  );
}
