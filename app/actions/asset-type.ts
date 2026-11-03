"use server";

import { revalidatePath } from "next/cache";
import {
  createAssetTypeRecord,
  deleteAssetTypeById,
  getAssetTypes as loadAssetTypes,
} from "@/lib/domain/asset-types";

export async function getAssetTypes() {
  return loadAssetTypes();
}

export async function createAssetType(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;

  await createAssetTypeRecord(name, code);

  revalidatePath("/settings");
  revalidatePath("/assets/create");
}

export async function deleteAssetType(id: string) {
  await deleteAssetTypeById(id);

  revalidatePath("/settings");
  revalidatePath("/assets/create");
}
