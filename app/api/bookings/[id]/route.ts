import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, authErrorResponse } from "@/lib/rbac";
import { bookingUpdateSchema } from "@/lib/validations";
import { updateBookingStatus } from "@/services/booking.service";
import { logAudit } from "@/lib/audit";

async function canManageBooking(userId: string, roles: string[], bookingHospitalId: string) {
  if (roles.includes("SUPER_ADMIN")) return true;
  const link = await prisma.hospitalUser.findUnique({
    where: { hospitalId_userId: { hospitalId: bookingHospitalId, userId } },
  });
  return !!link;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = bookingUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });

    const isOwner = booking.userId === user.id;
    const canManage = await canManageBooking(user.id, user.roles, booking.hospitalId);
    if (!isOwner && !canManage) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    // المستخدم العادي يستطيع الإلغاء فقط
    if (isOwner && !canManage) {
      if (parsed.data.status && parsed.data.status !== "CANCELLED") {
        return NextResponse.json({ error: "يمكنك فقط إلغاء الحجز" }, { status: 403 });
      }
    }

    let result;
    if (parsed.data.status) {
      const { updated } = await updateBookingStatus(
        id,
        parsed.data.status,
        user.id,
        parsed.data.cancelReason
      );
      result = updated;
      await logAudit({
        userId: user.id,
        action: parsed.data.status === "CANCELLED" ? "CANCEL_BOOKING" : "UPDATE_BOOKING",
        entity: "Booking",
        entityId: id,
        metadata: { status: parsed.data.status },
      });
    } else {
      result = await prisma.booking.update({
        where: { id },
        data: {
          date: parsed.data.date ? new Date(parsed.data.date) : undefined,
          startTime: parsed.data.startTime,
          notes: parsed.data.notes,
        },
      });
      await logAudit({ userId: user.id, action: "RESCHEDULE_BOOKING", entity: "Booking", entityId: id });
    }

    return NextResponse.json({ booking: result, message: "تم تحديث الحجز" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });

    const canManage = await canManageBooking(user.id, user.roles, booking.hospitalId);
    if (booking.userId !== user.id && !canManage) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    // الحذف الفعلي = إلغاء (نحتفظ بالسجل)
    const { updated } = await updateBookingStatus(id, "CANCELLED", user.id, "حذف/إلغاء من المستخدم");
    await logAudit({ userId: user.id, action: "CANCEL_BOOKING", entity: "Booking", entityId: id });

    return NextResponse.json({ booking: updated, message: "تم إلغاء الحجز" });
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
