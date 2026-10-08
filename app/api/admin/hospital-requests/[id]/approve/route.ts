import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { notifySuperAdmins } from "@/lib/notifications";
import { HOSPITAL_PERMISSIONS } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const { id } = await params;

    const request = await prisma.hospitalRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.status === "APPROVED")
      return NextResponse.json({ error: "تمت الموافقة مسبقًا" }, { status: 409 });

    await prisma.$transaction([
      prisma.hospitalRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
      }),
      prisma.hospital.update({ where: { id: request.hospitalId }, data: { status: "ACTIVE" } }),
      // تفعيل جميع الصلاحيات افتراضيًا عند القبول
      prisma.hospitalPermission.createMany({
        data: HOSPITAL_PERMISSIONS.map((p) => ({
          hospitalId: request.hospitalId,
          permission: p,
          enabled: true,
        })),
        skipDuplicates: true,
      }),
    ]);

    await logAudit({ userId: admin.id, action: "APPROVE_HOSPITAL", entity: "Hospital", entityId: request.hospitalId });
    await notifySuperAdmins({
      type: "HOSPITAL_APPROVED",
      title: "تمت الموافقة على مستشفى",
      body: `تم تفعيل المستشفى رقم ${request.hospitalId}`,
    });

    return NextResponse.json({ message: "تمت الموافقة على المستشفى وتفعيله" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
