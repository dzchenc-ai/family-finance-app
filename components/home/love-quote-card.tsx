"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDailyLoveQuote, refreshDailyLoveQuote, QuoteResult } from "@/app/actions/love-quote";
import { toast } from "sonner";

const TITLES: Record<string, string> = {
  love_quote: "今日寄语",
  financial_status: "财务日报",
  spending_diagnosis: "消费诊断",
  what_to_eat: "今日菜单",
};

export function LoveQuoteCard() {
  const [quoteData, setQuoteData] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getDailyLoveQuote();
      setQuoteData(data);
    } catch (error) {
      console.error("Failed to load quote data", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const newData = await refreshDailyLoveQuote();
      if (newData) {
        setQuoteData(newData);
        toast.success("已更新今日内容");
      }
    } catch (error) {
      toast.error("更新失败");
    } finally {
      setRefreshing(false);
    }
  }

  const title = TITLES[quoteData?.type || "love_quote"] || "今日寄语";

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            aria-label="换一则"
          >
            <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <p className="mt-4 flex-1 whitespace-pre-wrap font-display text-[17px] leading-relaxed text-foreground/90">
            {quoteData?.content || "内容生成中"}
          </p>
        )}

        {quoteData?.type === "love_quote" && quoteData.daysLoved !== null && (
          <p className="mt-5 text-xs text-muted-foreground">
            在一起的第 <span className="money text-sm text-foreground">{quoteData.daysLoved}</span> 天
          </p>
        )}
      </CardContent>
    </Card>
  );
}
