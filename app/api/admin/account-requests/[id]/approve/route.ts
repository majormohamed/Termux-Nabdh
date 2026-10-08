import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    const request = await prisma.accountRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.status !== "PENDING")
      return NextResponse.json({ error: "تمت مراجعة هذا الطلب مسبقًا" }, { status: 409 });

    await prisma.$transaction([
      prisma.accountRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
      }),
      prisma.user.update({ where: { id: request.userId }, data: { status: "ACTIVE" } }),
    ]);

    await logAudit({ userId: admin.id, action: "APPROVE_USER", entity: "User", entityId: request.userId });
    await notify({
      userId: request.userId,
      type: "ACCOUNT_APPROVED",
      title: "تم تفعيل حسابك",
      body: "تمت الموافقة على حسابك، يمكنك الآن تسجيل الدخول واستخدام نبض.",
      link: "/login",
    });

    return NextResponse.json({ message: "تمت الموافقة على الحساب" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
