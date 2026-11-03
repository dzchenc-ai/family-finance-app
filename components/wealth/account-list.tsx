'use client';

import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountCard } from "./account-card";

interface AccountListProps {
  accounts: any[];
  users?: { id: string; name: string | null; email: string }[];
  isVisible?: boolean;
}

export function AccountList({ accounts, users = [], isVisible = true }: AccountListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const formatCurrency = (value: number) => {
    if (!isVisible) return '******';
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
  };

  const filteredAccounts = selectedUserId === "all" 
    ? accounts 
    : accounts.filter(account => account.userId === selectedUserId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">资金账户</h2>
          <p className="mt-1 text-sm text-muted-foreground">现金、储蓄、银行卡和负债</p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
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
          <Link href="/accounts/create">
            <Button>
              <Plus className="h-4 w-4" /> 添加账户
            </Button>
          </Link>
        </div>
      </div>
      
      {filteredAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
             <CreditCard className="mb-3 h-5 w-5 text-muted-foreground" />
             <p className="text-sm text-muted-foreground">还没有资金账户</p>
             <Link href="/accounts/create" className="mt-4">
               <Button variant="outline" size="sm">添加第一个账户</Button>
             </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAccounts.map((account) => (
            <AccountCard 
              key={account.id} 
              account={account} 
              formatCurrency={formatCurrency} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
