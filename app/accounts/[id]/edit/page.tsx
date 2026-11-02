import { redirect } from "next/navigation";
import { updateAccount } from "@/app/actions/account";
import { AccountForm } from "@/components/accounts/account-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccountWithChildren, listTopLevelAccounts } from "@/lib/domain/accounts";
import { listUsersIfAdmin } from "@/lib/domain/users";

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  const account = await getAccountWithChildren(params.id);

  if (!account) {
    redirect("/wealth?tab=accounts");
  }

  const parentAccounts = await listTopLevelAccounts();
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const users = await listUsersIfAdmin(isAdmin);
  const updateAccountWithId = updateAccount.bind(null, account.id);

  return (
    <div className="flex justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>编辑账户</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm
            action={updateAccountWithId}
            parentAccounts={parentAccounts}
            defaultValues={account}
            users={users}
          />
        </CardContent>
      </Card>
    </div>
  );
}
