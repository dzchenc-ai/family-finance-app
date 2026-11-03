"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountList } from "@/components/wealth/account-list";
import { AssetList } from "@/components/wealth/asset-list";

interface WealthDashboardProps {
  totalWealth: number;
  totalAccountBalance: number;
  totalAssetValue: number;
  accounts: any[];
  assets: any[];
  assetTypes: any[];
  users: any[];
  defaultTab: string;
}

function formatCny(value: number, hidden: boolean) {
  if (hidden) return "••••••";
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function WealthDashboard({
  totalWealth,
  totalAccountBalance,
  totalAssetValue,
  accounts,
  assets,
  assetTypes,
  users,
  defaultTab,
}: WealthDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="page-shell space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">资产负债表</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">家庭资产</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isVisible ? "隐藏金额" : "显示金额"}
        </button>
      </header>

      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <p className="text-sm text-muted-foreground">净资产</p>
        <p className="money mt-2 text-4xl md:text-5xl">{formatCny(totalWealth, !isVisible)}</p>
        <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">资金账户</p>
            <p className="money mt-1 text-xl">{formatCny(totalAccountBalance, !isVisible)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">投资资产</p>
            <p className="money mt-1 text-xl">{formatCny(totalAssetValue, !isVisible)}</p>
          </div>
        </div>
      </section>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">资金账户</TabsTrigger>
          <TabsTrigger value="assets">投资资产</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-6">
          <AccountList accounts={accounts} users={users} isVisible={isVisible} />
        </TabsContent>
        <TabsContent value="assets" className="mt-6">
          <AssetList assets={assets} assetTypes={assetTypes} users={users} isVisible={isVisible} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
