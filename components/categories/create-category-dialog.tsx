'use client';

import { createCategory } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "添加中..." : "确认添加"}
    </Button>
  );
}

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createCategory(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> 新增分类
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增分类</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">分类名称</Label>
            <Input id="name" name="name" placeholder="例如：餐饮、交通" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">类型</Label>
            <Select name="type" required defaultValue="EXPENSE">
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">支出</SelectItem>
                <SelectItem value="INCOME">收入</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
