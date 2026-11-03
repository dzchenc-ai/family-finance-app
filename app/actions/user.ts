"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { getCurrentUser as loadCurrentUser } from "@/lib/auth/current-user";
import {
  createUserRecord,
  deleteUserById,
  resetUserPasswordRecord,
  updateUserEmailRecord,
  updateUserRecord,
} from "@/lib/domain/users";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = (formData.get("password") as string) || "password";
  const role = (formData.get("role") as string) || "USER";

  await createUserRecord({ name, email, password, role });
  revalidatePath("/settings");
}

export async function deleteUser(userId: string) {
  await deleteUserById(userId);
  revalidatePath("/settings");
}

export async function updateUser(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  await updateUserRecord(userId, name, email);
  revalidatePath("/users");
}

export async function updateUserEmail(userId: string, newEmail: string) {
  await updateUserEmailRecord(userId, newEmail);
  revalidatePath("/settings");
}

export async function switchUser(_userId: string) {
  console.warn("Switch user is deprecated. Use logout/login.");
}

export async function getCurrentUser() {
  return loadCurrentUser();
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

export async function resetUserPassword(userId: string, newPassword: string) {
  await resetUserPasswordRecord(userId, newPassword);
  revalidatePath("/settings");
}
