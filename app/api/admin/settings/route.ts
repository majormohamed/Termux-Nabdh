import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request) {
  try {
    const admin = await requireRole("SUPER_ADMIN");
    const body = (await req.json()) as Record<string, string>;
    if (typeof body !== "object" || !body) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAudit({ userId: admin.id, action: "UPDATE_SETTINGS", entity: "SystemSetting" });
    return NextResponse.json({ message: "تم الحفظ" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
