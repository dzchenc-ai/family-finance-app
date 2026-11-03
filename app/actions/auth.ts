"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { registerUser } from "@/lib/domain/users";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

function authErrorMessage(error: AuthError) {
  switch (error.type) {
    case "CredentialsSignin":
      return "邮箱或密码错误";
    default:
      return "发生了一些错误";
  }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorMessage(error);
    }
    throw error;
  }
}

export async function register(prevState: string | undefined, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields.success) {
    return "字段无效，注册失败";
  }

  const registrationError = await registerUser(validatedFields.data);
  if (registrationError) {
    return registrationError;
  }

  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorMessage(error);
    }
    throw error;
  }
}
