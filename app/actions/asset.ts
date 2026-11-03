"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createAssetRecord,
  deleteAssetRecord,
  getAssetsForUpdate as loadAssetsForUpdate,
  updateAssetRecord,
  updateBatchGoldPrices as applyBatchGoldPrices,
  updateSingleAssetPrice as applySingleAssetPrice,
  type AssetWriteInput,
} from "@/lib/domain/assets";

function readAssetFields(formData: FormData): AssetWriteInput {
  const marketPrice = formData.get("marketPrice");
  return {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    symbol: formData.get("symbol") as string,
    quantity: parseFloat(formData.get("quantity") as string),
    costPrice: parseFloat(formData.get("costPrice") as string),
    inputMarketPrice: marketPrice ? parseFloat(marketPrice as string) : null,
    userId: formData.get("userId") as string,
  };
}

export async function createAsset(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }

  await createAssetRecord(user, readAssetFields(formData));

  revalidatePath("/assets");
  revalidatePath("/wealth");
  redirect("/wealth?tab=assets");
}

export async function getAssetsForUpdate() {
  return loadAssetsForUpdate();
}

export async function updateBatchGoldPrices(ids: string[]) {
  return applyBatchGoldPrices(ids);
}

export async function updateSingleAssetPrice(id: string) {
  return applySingleAssetPrice(id);
}

export async function revalidateAssets() {
  revalidatePath("/assets");
  revalidatePath("/wealth");
}

export async function updateAssetPrices() {
  return { success: false, message: "Please use client-side update" };
}

export async function updateAsset(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }

  await updateAssetRecord(id, user, readAssetFields(formData));

  revalidatePath("/assets");
  revalidatePath("/wealth");
  redirect("/wealth?tab=assets");
}

export async function deleteAsset(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }

  await deleteAssetRecord(id, user);

  revalidatePath("/assets");
  revalidatePath("/wealth");
  redirect("/wealth?tab=assets");
}
