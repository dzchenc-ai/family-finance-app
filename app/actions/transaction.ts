"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createTransactionRecord,
  deleteTransactionRecords,
  updateTransactionRecord,
} from "@/lib/domain/transactions";

function readTransactionFields(formData: FormData) {
  const categoryId = formData.get("categoryId") as string;
  return {
    amount: parseFloat(formData.get("amount") as string),
    type: formData.get("type") as string,
    description: formData.get("description") as string,
    categoryId: categoryId === "none" ? null : categoryId,
    accountId: formData.get("accountId") as string,
    date: new Date(formData.get("date") as string),
  };
}

export async function createTransaction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not found. Please create a user first.");
  }

  await createTransactionRecord({
    ...readTransactionFields(formData),
    userId: user.id,
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  redirect("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  await updateTransactionRecord(id, readTransactionFields(formData));

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  redirect("/transactions");
}

export async function deleteTransactions(ids: string[]) {
  await deleteTransactionRecords(ids);
  revalidatePath("/transactions");
  revalidatePath("/accounts");
}

export async function deleteTransaction(id: string) {
  await deleteTransactions([id]);
}
