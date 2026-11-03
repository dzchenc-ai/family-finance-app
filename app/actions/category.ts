"use server";

import { revalidatePath } from "next/cache";
import { createCategoryRecord, deleteCategoryById } from "@/lib/domain/categories";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  await createCategoryRecord(name, type);

  revalidatePath("/categories");
  revalidatePath("/transactions/create");
  revalidatePath("/transactions");
}

export async function deleteCategory(id: string) {
  await deleteCategoryById(id);

  revalidatePath("/categories");
  revalidatePath("/transactions/create");
  revalidatePath("/transactions");
}
