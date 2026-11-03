import { createAccount } from "@/app/actions/account";
import { AccountForm } from "@/components/accounts/account-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTopLevelAccounts } from "@/lib/domain/accounts";

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accounts = await listTopLevelAccounts();
  const parentId = typeof searchParams.parentId === "string" ? searchParams.parentId : undefined;

  return (
    <div className="page-shell flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">添加账户</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm
            action={createAccount}
            parentAccounts={accounts}
            defaultValues={parentId ? ({ parentId } as any) : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
