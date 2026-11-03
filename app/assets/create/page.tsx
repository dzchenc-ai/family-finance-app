import { CreateAssetForm } from "@/components/wealth/create-asset-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAssetTypes } from "@/lib/domain/asset-types";
import { listUsersIfAdmin } from "@/lib/domain/users";

export default async function CreateAssetPage() {
  const assetTypes = await getAssetTypes();
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const users = await listUsersIfAdmin(isAdmin);

  return (
    <div className="flex justify-center p-8">
      <CreateAssetForm assetTypes={assetTypes} users={users} />
    </div>
  );
}
