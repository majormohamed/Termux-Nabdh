import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, authErrorResponse } from "@/lib/rbac";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "الإشعار غير موجود" }, { status: 404 });
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ message: "تم" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
