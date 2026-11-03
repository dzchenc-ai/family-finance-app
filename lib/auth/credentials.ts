import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

/** Accepts both bcrypt hashes and the legacy plaintext passwords stored by this app. */
export async function passwordMatches(storedPassword: string, password: string) {
  if (storedPassword.startsWith("$2")) {
    return bcrypt.compare(password, storedPassword);
  }
  return password === storedPassword;
}
