import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Resolve the signed-in Prisma user. Not a Server Action. */
export async function getCurrentUser() {
  const session = await auth();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user) return user;
  }

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) return user;
  }

  return null;
}
