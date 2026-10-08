import { prisma } from "@/lib/prisma";
import { requireAuth, type SessionUser } from "@/lib/rbac";

/** يعيد المستشفى المرتبط بالمستخدم الحالي (أو أول مستشفى نشط للمدير العام) */
export async function getCurrentHospital(): Promise<{
  user: SessionUser;
  hospitalId: string | null;
}> {
  const user = await requireAuth();
  if (user.roles.includes("SUPER_ADMIN")) {
    const h = await prisma.hospital.findFirst({ where: { status: "ACTIVE" } });
    return { user, hospitalId: h?.id ?? null };
  }
  const link = await prisma.hospitalUser.findFirst({ where: { userId: user.id } });
  return { user, hospitalId: link?.hospitalId ?? null };
}
