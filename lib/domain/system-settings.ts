import { prisma } from "@/lib/prisma";

/**
 * Server-side read of a single setting.
 * This module is not a Server Action, so it cannot be called from the client.
 */
export async function getSystemSettingInternal(key: string) {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });
  return setting?.value;
}

export async function listSystemSettingsMap() {
  const settings = await prisma.systemSetting.findMany();
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function upsertSystemSetting(key: string, value: string) {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
