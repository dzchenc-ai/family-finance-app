'use client';

import Link from "next/link";
import { Plus, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshAssetButton } from "./refresh-asset-button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssetListProps {
  assets: any[];
  assetTypes?: any[];
  users?: { id: string; name: string | null; email: string }[];
  isVisible?: boolean;
}

export function AssetList({ assets, assetTypes = [], users = [], isVisible = true }: AssetListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const formatCurrency = (value: number) => {
    if (!isVisible) return '******';
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  };

  const formatPercent = (value: number) => {
    if (!isVisible) return '***';
    return value.toFixed(2) + '%';
  };

  const filteredAssets = selectedUserId === "all" ? assets : assets.filter(asset => asset.userId === selectedUserId);

  const totalCost = filteredAssets.reduce((sum, asset) => sum + (asset.costPrice * asset.quantity), 0);
  const totalMarketValue = filteredAssets.reduce((sum, asset) => sum + ((asset.marketPrice || asset.costPrice) * asset.quantity), 0);
  const totalProfit = totalMarketValue - totalCost;
  const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const typeMap = assetTypes.reduce((acc, type) => {
    acc[type.code] = type.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">投资组合</h2>
          <p className="mt-1 text-sm text-muted-foreground">持仓、市值与浮动盈亏</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {users.length > 0 && (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选归属人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部用户</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <RefreshAssetButton />
          <Link href="/assets/create">
            <Button>
              <Plus className="h-4 w-4" /> 添加资产
            </Button>
          </Link>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">市值</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="money text-2xl">¥{formatCurrency(totalMarketValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">成本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="money text-2xl">¥{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">浮动盈亏</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`money text-2xl ${totalProfit >= 0 ? "text-market-up" : "text-market-down"}`}>
              {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">收益率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`money text-2xl ${profitRate >= 0 ? "text-market-up" : "text-market-down"}`}>
              {profitRate >= 0 ? "+" : ""}{formatPercent(profitRate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资产列表 */}
      <Card>
        <div className="overflow-x-auto">
          {filteredAssets.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
               <p className="text-sm text-muted-foreground">还没有投资持仓</p>
               <Link href="/assets/create" className="mt-4">
                 <Button variant="outline" size="sm">添加第一项资产</Button>
               </Link>
             </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-12 px-4 font-medium text-muted-foreground">资产名称</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground">类型</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground text-right">持仓</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground text-right">成本 / 现价</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground text-right">市值</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground text-right">盈亏</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const marketPrice = asset.marketPrice || asset.costPrice;
                  const marketValue = marketPrice * asset.quantity;
                  const profit = marketValue - (asset.costPrice * asset.quantity);
                  const profitPercent = asset.costPrice > 0 ? (profit / (asset.costPrice * asset.quantity)) * 100 : 0;

                  return (
                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-foreground">{asset.name}</div>
                        {asset.symbol && <div className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-fit mt-1">{asset.symbol}</div>}
                        {asset.user && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{asset.user.name || asset.user.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
                          {typeMap[asset.type] || (
                            <>
                              {asset.type === 'STOCK' && '股票'}
                              {asset.type === 'FUND' && '基金'}
                              {asset.type === 'REAL_ESTATE' && '房产'}
                              {asset.type === 'GOLD' && '黄金'}
                              {asset.type === 'OTHER' && '其他'}
                              {!['STOCK', 'FUND', 'REAL_ESTATE', 'GOLD', 'OTHER'].includes(asset.type) && asset.type}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">{asset.quantity}</td>
                      <td className="p-4 text-right text-xs text-muted-foreground">
                        <div className="money">¥{formatCurrency(asset.costPrice)}</div>
                        <div className="money">¥{formatCurrency(marketPrice)}</div>
                      </td>
                      <td className="money p-4 text-right">¥{formatCurrency(marketValue)}</td>
                      <td className="p-4 text-right">
                        <div className={`money ${profit >= 0 ? "text-market-up" : "text-market-down"}`}>
                          {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                        </div>
                        <div className={`text-xs ${profit >= 0 ? "text-market-up" : "text-market-down"}`}>
                          {formatPercent(profitPercent)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/assets/${asset.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
