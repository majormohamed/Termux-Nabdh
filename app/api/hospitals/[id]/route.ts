import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: {
      departments: { include: { doctors: true, services: true } },
      doctors: true,
      services: { where: { isActive: true } },
      medicalTests: { where: { isActive: true } },
      rooms: true,
      reviews: { include: { user: { select: { fullName: true } } }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });
  if (!hospital) return NextResponse.json({ error: "المستشفى غير موجود" }, { status: 404 });
  return NextResponse.json({ hospital });
}
