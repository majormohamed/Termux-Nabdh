import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole, authErrorResponse } from "@/lib/rbac";
import { bookingCreateSchema } from "@/lib/validations";
import { createBooking, BookingConflictError } from "@/services/booking.service";
import { logAudit } from "@/lib/audit";

// GET /api/bookings — المستخدم يرى حجوزاته، والمدير/موظف المستشفى يرى حسب النطاق
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");
    const status = searchParams.get("status");

    let where = {};
    if (hasRole(user, "SUPER_ADMIN")) {
      where = { ...(hospitalId ? { hospitalId } : {}), ...(status ? { status: status as never } : {}) };
    } else if (hospitalId) {
      const link = await prisma.hospitalUser.findUnique({
        where: { hospitalId_userId: { hospitalId, userId: user.id } },
      });
      where = link ? { hospitalId } : { userId: user.id };
    } else {
      where = { userId: user.id };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        hospital: { select: { id: true, name: true, logoUrl: true } },
        doctor: { select: { fullName: true, specialty: true } },
        service: { select: { name: true } },
        medicalTest: { select: { name: true, category: true } },
        room: { select: { number: true, type: true } },
        user: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

// POST /api/bookings
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const booking = await createBooking(user.id, parsed.data);
    await logAudit({ userId: user.id, action: "CREATE_BOOKING", entity: "Booking", entityId: booking.id });

    return NextResponse.json({ booking, message: "تم إنشاء الحجز بنجاح" }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingConflictError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    if (e instanceof Error && !("code" in e)) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
