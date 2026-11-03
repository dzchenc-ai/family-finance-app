"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listSystemSettingsMap, upsertSystemSetting } from "@/lib/domain/system-settings";

export async function getSystemSettings() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return listSystemSettingsMap();
}

export async function updateSystemSetting(key: string, value: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await upsertSystemSetting(key, value);
  revalidatePath("/settings");
}
