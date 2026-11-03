'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionActions } from "@/components/transactions/transaction-actions";
import { PaginationControl } from "@/components/pagination-control";
import { deleteTransactions } from "@/app/actions/transaction";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  transactions: any[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export function TransactionList({ 
  transactions, 
  page, 
  pageSize, 
  totalPages, 
  totalCount 
}: TransactionListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map(tx => tx.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransactions(selectedIds);
      setSelectedIds([]);
      setIsDeleteDialogOpen(false);
      toast({
        title: "删除成功",
        description: `已删除 ${selectedIds.length} 条记录`,
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center px-2">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length > 0 ? `已选择 ${selectedIds.length} 项` : `共 ${totalCount} 条记录`}
        </div>
        {selectedIds.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> 批量删除
          </Button>
        )}
      </div>

      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">这个筛选条件下没有流水</p>
            <Link href="/transactions/create" className="mt-4">
              <Button variant="outline" size="sm">记一笔</Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y md:hidden">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-start gap-3 px-4 py-3">
                  <Checkbox
                    className="mt-1"
                    checked={selectedIds.includes(tx.id)}
                    onCheckedChange={(checked) => handleSelectOne(tx.id, checked as boolean)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-medium">{tx.description || tx.category?.name || "未填写备注"}</p>
                      <span className={`money shrink-0 text-sm ${tx.type === "EXPENSE" ? "text-expense" : "text-income"}`}>
                        {tx.type === "EXPENSE" ? "−" : "+"}
                        {tx.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()} · {tx.category?.name || "无分类"} · {tx.account.name}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <TransactionActions id={tx.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="h-11 w-12 px-4">
                    <Checkbox 
                      checked={selectedIds.length === transactions.length && transactions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="h-11 px-4 text-xs font-medium text-muted-foreground">日期</th>
                  <th className="h-11 px-4 text-xs font-medium text-muted-foreground">分类</th>
                  <th className="h-11 px-4 text-xs font-medium text-muted-foreground">备注</th>
                  <th className="h-11 px-4 text-xs font-medium text-muted-foreground">记账人</th>
                  <th className="h-11 px-4 text-xs font-medium text-muted-foreground">账户</th>
                  <th className="h-11 px-4 text-right text-xs font-medium text-muted-foreground">金额</th>
                  <th className="h-11 px-4 text-right text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Checkbox 
                        checked={selectedIds.includes(tx.id)}
                        onCheckedChange={(checked) => handleSelectOne(tx.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3 text-foreground/90" suppressHydrationWarning>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                        {tx.category?.name || "无分类"}
                      </span>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                      {tx.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {/* @ts-ignore */}
                          <AvatarImage src={tx.user?.image || ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {tx.user?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{tx.user?.name || '未知'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{tx.account.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={`money flex items-center justify-end gap-1 ${tx.type === "EXPENSE" ? "text-expense" : "text-income"}`}>
                        {tx.type === "EXPENSE" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                        <span>
                          {tx.type === "EXPENSE" ? "−" : "+"}
                          {tx.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TransactionActions id={tx.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="border-t p-4">
               <PaginationControl 
                  currentPage={page}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  totalCount={totalCount}
               />
            </div>
          </>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除选中的 {selectedIds.length} 条记录吗？此操作无法撤销，且会影响相关账户的余额。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
