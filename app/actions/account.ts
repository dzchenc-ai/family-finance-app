"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createAccountRecord,
  createChildAccountRecord,
  deleteAccountById,
  updateAccountRecord,
} from "@/lib/domain/accounts";

function readAccountFields(formData: FormData) {
  const parentId = formData.get("parentId") as string;
  return {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    balance: parseFloat(formData.get("balance") as string) || 0,
    currency: (formData.get("currency") as string) || "CNY",
    parentId,
    icon: formData.get("icon") as string,
    userId: formData.get("userId") as string,
  };
}

function readChildUpdates(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const childUpdates: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(rawFormData)) {
    if (!key.startsWith("child_")) continue;
    const parts = key.split("_");
    if (parts.length < 3) continue;

    const childId = parts[1];
    const field = parts.slice(2).join("_");
    if (!childUpdates[childId]) {
      childUpdates[childId] = {};
    }

    if (field === "balance") {
      childUpdates[childId][field] = parseFloat(value as string) || 0;
    } else {
      childUpdates[childId][field] = value;
    }
  }

  return childUpdates;
}

export async function createAccount(formData: FormData) {
  const fields = readAccountFields(formData);
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("请先登录");
  }

  await createAccountRecord(user, {
    ...fields,
    parentId: fields.parentId === "none" ? null : fields.parentId,
  });

  revalidatePath("/accounts");
  revalidatePath("/wealth");
  redirect("/wealth?tab=accounts");
}

export async function updateAccount(id: string, formData: FormData) {
  const fields = readAccountFields(formData);

  await updateAccountRecord(
    id,
    {
      ...fields,
      parentId: fields.parentId === "none" ? null : fields.parentId,
    },
    readChildUpdates(formData),
  );

  revalidatePath("/accounts");
  revalidatePath("/wealth");
  redirect("/wealth?tab=accounts");
}

export async function deleteAccount(id: string) {
  try {
    await deleteAccountById(id);
  } catch (error) {
    console.error("Failed to delete account:", error);
    throw error;
  }

  revalidatePath("/accounts");
  revalidatePath("/wealth");
}

export async function createChildAccount(formData: FormData) {
  const fields = readAccountFields(formData);
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("请先登录");
  }

  await createChildAccountRecord(user, {
    name: fields.name,
    type: fields.type,
    balance: fields.balance,
    currency: fields.currency,
    parentId: fields.parentId,
    icon: fields.icon,
  });

  revalidatePath("/accounts");
  revalidatePath("/wealth");
}
