import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const requests = await prisma.accountRequest.findMany({
      include: { user: { select: { fullName: true, email: true, phone: true, gender: true, birthDate: true, address: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
