import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createTransaction } from "@/app/actions/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { listAccountsForUser } from "@/lib/domain/accounts";
import { listCategories } from "@/lib/domain/categories";

export default async function CreateTransactionPage() {
  console.log("Rendering CreateTransactionPage...");
  const session = await auth();
  if (!session?.user?.id) {
    console.log("No user session, redirecting to login...");
    redirect("/login");
  }

  const userId = session.user.id;
  console.log(`Fetching data for user: ${userId}`);

  try {
    const [categories, accounts] = await Promise.all([
      listCategories(),
      listAccountsForUser(userId),
    ]);

    console.log(`Found ${categories.length} categories and ${accounts.length} accounts`);

    return (
      <div className="flex justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>记一笔</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm action={createTransaction} categories={categories} accounts={accounts} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error in CreateTransactionPage:", error);
    return <div>Error loading page. Please check logs.</div>;
  }
}
