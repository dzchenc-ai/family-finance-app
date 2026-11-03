import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany();
}

export async function listCategoriesNewestFirst() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCategoryRecord(name: string, type: string) {
  if (!name || !type) {
    throw new Error("名称和类型不能为空");
  }

  try {
    await prisma.category.create({
      data: { name, type },
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    throw new Error("创建分类失败");
  }
}

export async function deleteCategoryById(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw new Error("删除分类失败，可能该分类下有交易记录");
  }
}
