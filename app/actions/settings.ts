"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth/current-user";
import { changePasswordRecord, updateProfileRecord } from "@/lib/domain/profile";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await updateProfileRecord(user.id, {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    image: formData.get("image") as string,
  });

  revalidatePath("/settings");
  revalidatePath("/users");
}

export async function changePassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await changePasswordRecord(user.id, formData.get("newPassword") as string);
  await signOut({ redirectTo: "/login" });
}
