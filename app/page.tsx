import { HomeDashboard } from "@/components/home/home-dashboard";
import { loadHomeDashboard } from "@/lib/domain/home/dashboard";

export default async function Home() {
  const dashboard = await loadHomeDashboard();

  return (
    <HomeDashboard
      user={dashboard.user}
      totalWealth={dashboard.totalWealth}
      monthlyIncome={dashboard.monthlyIncome}
      monthlyExpense={dashboard.monthlyExpense}
      transactions={dashboard.transactions}
      chartData={dashboard.chartData}
    />
  );
}
