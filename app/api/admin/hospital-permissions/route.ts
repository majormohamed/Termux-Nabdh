import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { HOSPITAL_PERMISSIONS } from "@/lib/permissions";

// GET /api/admin/hospital-permissions?hospitalId=
export async function GET(req: Request) {
  try {
    await requireRole("SUPER_ADMIN");
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");
    if (!hospitalId) return NextResponse.json({ error: "hospitalId مطلوب" }, { status: 400 });

    const permissions = await prisma.hospitalPermission.findMany({ where: { hospitalId } });
    return NextResponse.json({ permissions });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

const toggleSchema = z.object({
  hospitalId: z.string().min(1),
  permission: z.enum(HOSPITAL_PERMISSIONS),
  enabled: z.boolean(),
});

// PATCH /api/admin/hospital-permissions
export async function PATCH(req: Request) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const body = await req.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }
    const { hospitalId, permission, enabled } = parsed.data;

    const record = await prisma.hospitalPermission.upsert({
      where: { hospitalId_permission: { hospitalId, permission } },
      update: { enabled },
      create: { hospitalId, permission, enabled },
    });

    await logAudit({
      userId: admin.id,
      action: "CHANGE_PERMISSION",
      entity: "HospitalPermission",
      entityId: record.id,
      metadata: { hospitalId, permission, enabled },
    });

    return NextResponse.json({ permission: record });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
