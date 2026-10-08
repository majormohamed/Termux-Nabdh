import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { requestChangesSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    const body = await req.json();
    const parsed = requestChangesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "اكتب الملاحظات المطلوب تعديلها" }, { status: 400 });
    }

    const request = await prisma.hospitalRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    await prisma.hospitalRequest.update({
      where: { id },
      data: {
        status: "CHANGES_REQUESTED",
        changeRequestNote: parsed.data.note,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      userId: admin.id,
      action: "REQUEST_HOSPITAL_CHANGES",
      entity: "HospitalRequest",
      entityId: id,
      metadata: { note: parsed.data.note },
    });

    return NextResponse.json({ message: "تم إرسال طلب التعديل" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
