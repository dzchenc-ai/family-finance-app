import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/auth/admin";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function listUsersBrief() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
}

export async function listUsersIfAdmin(isAdmin: boolean) {
  if (!isAdmin) return [];
  return listUsersBrief();
}

export async function createUserRecord(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const currentUser = await getCurrentUser();
  if (!isAdminUser(currentUser)) {
    throw new Error("只有管理员可以创建新用户");
  }

  try {
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("创建用户失败");
  }
}

export async function deleteUserById(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.budget.deleteMany({ where: { userId } });
      await tx.asset.deleteMany({ where: { userId } });
      await tx.account.updateMany({
        where: { userId },
        data: { parentId: null },
      });
      await tx.account.deleteMany({ where: { userId } });
      await tx.user.delete({
        where: { id: userId },
      });
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("删除用户失败");
  }
}

export async function updateUserRecord(userId: string, name: string, email: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}

export async function updateUserEmailRecord(userId: string, newEmail: string) {
  const currentUser = await getCurrentUser();
  if (!isAdminUser(currentUser)) {
    throw new Error("只有管理员可以修改用户邮箱");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("该邮箱已被其他用户使用");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  } catch (error) {
    console.error("Failed to update user email:", error);
    throw error instanceof Error ? error : new Error("更新邮箱失败");
  }
}

export async function resetUserPasswordRecord(userId: string, newPassword: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw new Error("重置密码失败");
  }
}

/** Returns an error message, or null when the account was created. */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<string | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return "该邮箱已被注册";
    }

    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    });

    return null;
  } catch (error) {
    console.error("Registration error:", error);
    return "创建用户失败";
  }
}
