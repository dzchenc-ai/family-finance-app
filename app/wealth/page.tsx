import { WealthDashboard } from "@/components/wealth/wealth-dashboard";
import { loadWealthOverview } from "@/lib/domain/wealth/overview";

export default async function WealthPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const overview = await loadWealthOverview();

  return (
    <WealthDashboard
      totalWealth={overview.totalWealth}
      totalAccountBalance={overview.totalAccountBalance}
      totalAssetValue={overview.totalAssetValue}
      accounts={overview.accounts}
      assets={overview.assets}
      assetTypes={overview.assetTypes}
      users={overview.users}
      defaultTab={(searchParams.tab as string) || "accounts"}
    />
  );
}
