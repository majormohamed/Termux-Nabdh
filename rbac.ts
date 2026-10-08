import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { RoleName, HospitalPermissionKey } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    roles: session.user.roles ?? [],
  };
}

export function hasRole(user: SessionUser | null, ...roles: RoleName[]): boolean {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return roles.some((r) => user.roles.includes(r));
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("UNAUTHENTICATED", "يجب تسجيل الدخول");
  return user;
}

export async function requireRole(...roles: RoleName[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasRole(user, ...roles)) throw new AuthError("FORBIDDEN", "ليس لديك صلاحية الوصول");
  return user;
}

/** صلاحية داخل مستشفى معين (HospitalUser) */
export async function requireHospitalAccess(hospitalId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.roles.includes("SUPER_ADMIN")) return user;
  const link = await prisma.hospitalUser.findUnique({
    where: { hospitalId_userId: { hospitalId, userId: user.id } },
  });
  if (!link) throw new AuthError("FORBIDDEN", "لست عضوًا في هذا المستشفى");
  return user;
}

/** هل الصلاحية مفعّلة للمستشفى؟ (يفترض أن المستشفى لديه جميع الصلاحيات ما لم تُعطّل صراحة) */
export async function hospitalHasPermission(
  hospitalId: string,
  permission: HospitalPermissionKey
): Promise<boolean> {
  const record = await prisma.hospitalPermission.findUnique({
    where: { hospitalId_permission: { hospitalId, permission } },
  });
  return record ? record.enabled : true;
}

export async function requireHospitalPermission(
  hospitalId: string,
  permission: HospitalPermissionKey
): Promise<SessionUser> {
  const user = await requireHospitalAccess(hospitalId);
  if (user.roles.includes("SUPER_ADMIN")) return user;
  const allowed = await hospitalHasPermission(hospitalId, permission);
  if (!allowed) throw new AuthError("FORBIDDEN", "هذه الصلاحية غير مفعّلة للمستشفى");
  return user;
}

export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
  }
}

/** تحويل أخطاء الحماية إلى استجابة API موحّدة */
export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message },
      { status: error.code === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }
  return null;
}
