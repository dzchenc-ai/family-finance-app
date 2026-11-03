"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="h-11 w-full" aria-disabled={pending} type="submit">
      {pending ? "正在登录…" : "登录"}
    </Button>
  );
}

export function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">登录</h1>
        <p className="text-sm text-muted-foreground">使用家庭账本的邮箱和密码</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="请输入密码"
            required
            autoComplete="current-password"
            className="h-11"
          />
        </div>
      </div>

      <div className="min-h-5" aria-live="polite" aria-atomic="true">
        {errorMessage && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
        )}
      </div>

      <LoginButton />
    </form>
  );
}
