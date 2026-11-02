'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTransactions } from "@/app/actions/export";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ExportButton() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      const params: { [key: string]: string } = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const base64 = await exportTransactions(params);
      
      // Create download link
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `交易明细_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "导出成功",
        description: "交易明细已成功导出为 Excel 文件",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "导出失败",
        description: "导出过程中发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="gap-2 shadow-sm" 
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4" />
      {loading ? "导出中..." : "导出 Excel"}
    </Button>
  );
}
