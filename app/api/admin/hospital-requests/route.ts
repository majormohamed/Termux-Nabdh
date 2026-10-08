import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const requests = await prisma.hospitalRequest.findMany({
      include: { hospital: true, documents: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
