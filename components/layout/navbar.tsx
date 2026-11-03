"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings } from "lucide-react";
import { NavbarUser } from "@/components/layout/navbar-user";

export function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return null;
  }

  const routes = [
    {
      href: "/",
      label: "总览",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/transactions",
      label: "账本",
      icon: ArrowRightLeft,
      active: pathname.startsWith("/transactions"),
    },
    {
      href: "/wealth",
      label: "资产",
      icon: Wallet,
      active: pathname.startsWith("/wealth") || pathname.startsWith("/accounts") || pathname.startsWith("/assets"),
    },
    {
      href: "/settings",
      label: "设置",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md safe-area-top">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-[15px] text-primary-foreground">
            家
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">家庭理财</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto no-scrollbar">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                route.active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>

        <NavbarUser />
      </div>
    </header>
  );
}
