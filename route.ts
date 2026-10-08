import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        status: u.status,
        roles: u.roles.map((r) => r.role.name),
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
