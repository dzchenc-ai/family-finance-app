import { prisma } from "@/lib/prisma";

export async function updateProfileRecord(
  userId: string,
  input: { name: string; email: string; image: string },
) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
        image: input.image,
      },
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update profile");
  }
}

export async function changePasswordRecord(userId: string, newPassword: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  } catch (error) {
    console.error("Failed to change password:", error);
    throw new Error("Failed to change password");
  }
}
