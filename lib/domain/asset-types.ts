import { prisma } from "@/lib/prisma";

const FIXED_TYPES = [
  { name: "港股", code: "HK_STOCK" },
  { name: "美股", code: "US_STOCK" },
  { name: "A股", code: "CN_STOCK" },
  { name: "房产", code: "REAL_ESTATE" },
  { name: "实物黄金", code: "PHYSICAL_GOLD" },
  { name: "基金", code: "FUND" },
  { name: "白银", code: "SILVER" },
];

function sortTypes<T extends { code: string; createdAt: Date }>(types: T[]) {
  const fixedCodes = FIXED_TYPES.map((t) => t.code);

  const fixedTypes = types.filter((t) => fixedCodes.includes(t.code));
  const customTypes = types.filter((t) => !fixedCodes.includes(t.code));

  fixedTypes.sort((a, b) => {
    return fixedCodes.indexOf(a.code) - fixedCodes.indexOf(b.code);
  });

  customTypes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return [...fixedTypes, ...customTypes];
}

export async function getAssetTypes() {
  const existingTypes = await prisma.assetType.findMany();
  const existingCodes = new Set(existingTypes.map((t) => t.code));
  const missingTypes = FIXED_TYPES.filter((t) => !existingCodes.has(t.code));

  if (missingTypes.length > 0) {
    for (const type of missingTypes) {
      await prisma.assetType.create({ data: type });
    }

    const allTypes = await prisma.assetType.findMany();
    return sortTypes(allTypes);
  }

  return sortTypes(existingTypes);
}

export async function createAssetTypeRecord(name: string, code: string) {
  if (!name || !code) {
    throw new Error("Name and Code are required");
  }

  if (FIXED_TYPES.some((t) => t.code === code.toUpperCase())) {
    throw new Error("Cannot use reserved code");
  }

  await prisma.assetType.create({
    data: {
      name,
      code: code.toUpperCase(),
    },
  });
}

export async function deleteAssetTypeById(id: string) {
  const type = await prisma.assetType.findUnique({ where: { id } });
  if (!type) return;

  if (FIXED_TYPES.some((t) => t.code === type.code)) {
    throw new Error("Cannot delete fixed asset type");
  }

  const count = await prisma.asset.count({
    where: { type: type.code },
  });

  if (count > 0) {
    throw new Error("Cannot delete type that is in use");
  }

  await prisma.assetType.delete({
    where: { id },
  });
}
