import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { rejectSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    const body = await req.json();
    const parsed = rejectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "سبب الرفض مطلوب" }, { status: 400 });
    }

    const request = await prisma.hospitalRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    await prisma.$transaction([
      prisma.hospitalRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectReason: parsed.data.reason,
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.hospital.update({ where: { id: request.hospitalId }, data: { status: "REJECTED" } }),
    ]);

    await logAudit({
      userId: admin.id,
      action: "REJECT_HOSPITAL",
      entity: "Hospital",
      entityId: request.hospitalId,
      metadata: { reason: parsed.data.reason },
    });

    return NextResponse.json({ message: "تم رفض المستشفى" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
