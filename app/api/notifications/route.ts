import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, authErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireAuth();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
