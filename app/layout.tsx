import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AiChatWidget } from "@/components/layout/ai-chat-widget";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

// Every screen reads the signed-in household from the database. Do not prerender it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "家庭理财管理系统",
  description: "全能家庭财务管家",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#101614" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <Navbar />
        {children}
        <AiChatWidget />
        <Toaster />
        <SonnerToaster position="top-left" duration={1000} />
      </body>
    </html>
  );
}
