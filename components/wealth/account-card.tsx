"use client";

import Link from "next/link";
import { CreditCard, Wallet, Landmark, Pencil, TrendingUp, PiggyBank, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: any;
  formatCurrency: (value: number) => string;
}

const TYPE_LABELS: Record<string, string> = {
  INVESTMENT: "投资",
  SAVINGS: "储蓄",
  CASH: "现金",
  DEBT: "负债",
  BANK: "银行卡",
  CREDIT: "信用卡",
  ALIPAY: "支付宝",
  WECHAT: "微信",
};

function typeTone(type: string) {
  switch (type) {
    case "CASH":
      return "bg-primary/10 text-primary";
    case "SAVINGS":
    case "BANK":
      return "bg-secondary text-foreground";
    case "INVESTMENT":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100";
    case "DEBT":
    case "CREDIT":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function AccountCard({ account, formatCurrency }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childTotal = account.children?.reduce((sum: number, child: any) => sum + child.balance, 0) || 0;
  const totalBalance = account.balance + childTotal;
  const hasChildren = account.children && account.children.length > 0;

  const icon = account.icon ? (
    <Avatar className="h-5 w-5">
      <AvatarImage src={account.icon} />
      <AvatarFallback>{account.name?.[0]}</AvatarFallback>
    </Avatar>
  ) : account.type === "CASH" ? (
    <Wallet className="h-4 w-4" />
  ) : account.type === "SAVINGS" ? (
    <PiggyBank className="h-4 w-4" />
  ) : account.type === "INVESTMENT" ? (
    <TrendingUp className="h-4 w-4" />
  ) : account.type === "DEBT" || account.type === "CREDIT" ? (
    <CreditCard className="h-4 w-4" />
  ) : (
    <Landmark className="h-4 w-4" />
  );

  return (
    <article className="flex flex-col rounded-xl border bg-card p-5 shadow-[0_1px_2px_rgba(20,28,24,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", typeTone(account.type))}>
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-medium">{account.name}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {TYPE_LABELS[account.type] || account.type}
              {account.user ? ` · ${account.user.name || account.user.email}` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/accounts/${account.id}/edit`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="编辑账户"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground">余额 · {account.currency || "CNY"}</p>
        <p className="money mt-1 text-2xl">{formatCurrency(totalBalance)}</p>
        {hasChildren && (
          <p className="mt-2 text-xs text-muted-foreground">
            主账户 {formatCurrency(account.balance)} · 子账户 {formatCurrency(childTotal)}
          </p>
        )}
      </div>

      {hasChildren && (
        <div className="mt-4 border-t pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
          >
            <span>子账户 {account.children.length}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {isExpanded && (
            <ul className="mt-2 space-y-1">
              {account.children.map((child: any) => (
                <li key={child.id} className="flex items-center justify-between rounded-md px-1 py-1 text-sm">
                  <span className="text-muted-foreground">{child.name}</span>
                  <span className="money">{formatCurrency(child.balance)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
