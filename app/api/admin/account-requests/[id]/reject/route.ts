import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { rejectSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    const body = await req.json();
    const parsed = rejectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "سبب الرفض مطلوب" }, { status: 400 });
    }

    const request = await prisma.accountRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.status !== "PENDING")
      return NextResponse.json({ error: "تمت مراجعة هذا الطلب مسبقًا" }, { status: 409 });

    await prisma.$transaction([
      prisma.accountRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectReason: parsed.data.reason,
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { status: "REJECTED", rejectReason: parsed.data.reason },
      }),
    ]);

    await logAudit({ userId: admin.id, action: "REJECT_USER", entity: "User", entityId: request.userId, metadata: { reason: parsed.data.reason } });
    await notify({
      userId: request.userId,
      type: "ACCOUNT_REJECTED",
      title: "تم رفض طلب الحساب",
      body: `السبب: ${parsed.data.reason}`,
    });

    return NextResponse.json({ message: "تم رفض الحساب" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
