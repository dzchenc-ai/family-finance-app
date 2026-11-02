import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAsset } from "@/app/actions/asset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditAssetForm } from "@/components/wealth/edit-asset-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAssetById } from "@/lib/domain/assets";
import { getAssetTypes } from "@/lib/domain/asset-types";
import { listUsersIfAdmin } from "@/lib/domain/users";

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const assetTypes = await getAssetTypes();
  const asset = await getAssetById(params.id);

  if (!asset) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const users = await listUsersIfAdmin(isAdmin);
  const deleteAssetWithId = deleteAsset.bind(null, asset.id);

  return (
    <div className="flex justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>编辑资产</CardTitle>
          <form action={deleteAssetWithId}>
            <Button variant="destructive" size="icon" type="submit">
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <EditAssetForm asset={asset} assetTypes={assetTypes} users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
