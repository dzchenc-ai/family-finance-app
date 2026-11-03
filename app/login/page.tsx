import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary px-12 py-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15 font-display text-lg">
            家
          </span>
          <span className="text-sm font-medium tracking-wide">家庭理财</span>
        </div>
        <div className="max-w-md">
          <p className="font-display text-4xl leading-tight">把家里的钱，看清楚。</p>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            账户、投资和日常收支放在一处。金额默认隐藏，只在你需要时展开。
          </p>
        </div>
        <p className="text-xs text-primary-foreground/55">私人账本 · 家庭共用</p>
      </section>

      <section className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-2xl">家庭理财</p>
            <p className="mt-1 text-sm text-muted-foreground">登录后继续查看家庭账本</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
