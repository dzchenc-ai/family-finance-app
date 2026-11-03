import { getCurrentUser } from "@/lib/auth/current-user";
import { listAssetTypes, listAssetsWithOwner } from "@/lib/domain/assets";
import { listWealthAccounts } from "@/lib/domain/accounts";
import { listUsersBrief } from "@/lib/domain/users";

export async function loadWealthOverview() {
  let accounts: Awaited<ReturnType<typeof listWealthAccounts>> = [];
  try {
    accounts = await listWealthAccounts();
  } catch (e) {
    console.error(e);
  }

  // Kept so this read model still touches the session the page used to load.
  await getCurrentUser();

  const users = await listUsersBrief();
  const assets = await listAssetsWithOwner();
  const assetTypes = await listAssetTypes();

  const totalAccountBalance = accounts.reduce((sum, account) => {
    const childBalance =
      account.children?.reduce((cSum: number, child: { balance: number }) => cSum + child.balance, 0) || 0;
    return sum + account.balance + childBalance;
  }, 0);

  const totalAssetValue = assets.reduce((sum, asset) => {
    const price = asset.marketPrice || asset.costPrice;
    return sum + price * asset.quantity;
  }, 0);

  const totalWealth = totalAccountBalance + totalAssetValue;

  return {
    totalWealth,
    totalAccountBalance,
    totalAssetValue,
    accounts,
    assets,
    assetTypes,
    users,
  };
}
