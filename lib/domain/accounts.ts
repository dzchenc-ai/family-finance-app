import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function listTopLevelAccounts() {
  return prisma.account.findMany({
    where: { parentId: null },
  });
}

export async function getAccountWithChildren(id: string) {
  return prisma.account.findUnique({
    where: { id },
    include: { children: true },
  });
}

/** Accounts shown on the wealth page, including nested children. */
export async function listWealthAccounts() {
  return prisma.account.findMany({
    where: { parentId: null },
    include: {
      children: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function listAccountsForUser(userId: string) {
  return prisma.account.findMany({ where: { userId } });
}

export async function listAllAccounts() {
  return prisma.account.findMany();
}

type AccountOwner = { id: string };

export type NewAccountInput = {
  name: string;
  type: string;
  balance: number;
  currency: string;
  parentId: string | null;
  icon: string;
};

export async function createAccountRecord(user: AccountOwner, input: NewAccountInput) {
  try {
    await prisma.account.create({
      data: {
        name: input.name,
        type: input.type,
        balance: input.balance,
        currency: input.currency,
        userId: user.id,
        parentId: input.parentId,
        icon: input.icon,
      },
    });
  } catch (error) {
    console.error("Failed to create account:", error);
    throw new Error("创建账户失败");
  }
}

export async function createChildAccountRecord(user: AccountOwner, input: NewAccountInput) {
  try {
    await prisma.account.create({
      data: {
        name: input.name,
        type: input.type,
        balance: input.balance,
        currency: input.currency,
        userId: user.id,
        parentId: input.parentId,
        icon: input.icon,
      },
    });
  } catch (error) {
    console.error("Failed to create child account:", error);
    throw new Error("创建子账户失败");
  }
}

export type AccountUpdateInput = NewAccountInput & {
  userId: string;
};

export async function updateAccountRecord(
  id: string,
  input: AccountUpdateInput,
  childUpdates: Record<string, Record<string, unknown>>,
) {
  try {
    await prisma.$transaction(async (tx) => {
      const updateData: {
        name: string;
        type: string;
        balance: number;
        currency: string;
        parentId: string | null;
        icon: string;
        userId?: string;
      } = {
        name: input.name,
        type: input.type,
        balance: input.balance,
        currency: input.currency,
        parentId: input.parentId,
        icon: input.icon,
      };

      const currentUser = await getCurrentUser();
      if (currentUser?.role === "ADMIN" && input.userId) {
        updateData.userId = input.userId;
      }

      await tx.account.update({
        where: { id },
        data: updateData,
      });

      for (const [childId, data] of Object.entries(childUpdates)) {
        await tx.account.update({
          where: { id: childId },
          data,
        });
      }
    });
  } catch (error) {
    console.error("Failed to update account:", error);
    throw new Error("更新账户失败");
  }
}

export async function deleteAccountById(id: string) {
  const transactionCount = await prisma.transaction.count({
    where: { accountId: id },
  });

  if (transactionCount > 0) {
    throw new Error("该账户下有交易记录，无法删除");
  }

  const childrenCount = await prisma.account.count({
    where: { parentId: id },
  });

  if (childrenCount > 0) {
    throw new Error("该账户下有子账户，无法删除");
  }

  await prisma.account.delete({
    where: { id },
  });
}
