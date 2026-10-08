import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import type { BookingCreateInput } from "@/lib/validations";
import type { BookingStatus, Prisma } from "@prisma/client";

export class BookingConflictError extends Error {
  constructor(message = "هذا الموعد محجوز مسبقًا، اختر وقتًا آخر") {
    super(message);
  }
}

function generateReference() {
  return `NBD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

/** منع الحجز المزدوج لنفس الطبيب/الغرفة في نفس التاريخ والوقت */
async function assertNoConflict(
  input: BookingCreateInput,
  bookingDate: Date,
  excludeBookingId?: string
) {
  const base: Prisma.BookingWhereInput = {
    date: bookingDate,
    startTime: input.startTime,
    status: { in: ["PENDING", "CONFIRMED"] },
    ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
  };

  if (input.type === "APPOINTMENT" && input.doctorId) {
    const clash = await prisma.booking.findFirst({
      where: { ...base, doctorId: input.doctorId },
      select: { id: true },
    });
    if (clash) throw new BookingConflictError("الطبيب لديه حجز في هذا الموعد");
  }

  if (input.type === "ROOM" && input.roomId) {
    const clash = await prisma.booking.findFirst({
      where: { ...base, roomId: input.roomId },
      select: { id: true },
    });
    if (clash) throw new BookingConflictError("الغرفة محجوزة في هذا التاريخ");

    const room = await prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room || room.status !== "AVAILABLE") {
      throw new BookingConflictError("الغرفة غير متاحة حاليًا");
    }
  }
}

export async function createBooking(userId: string, input: BookingCreateInput) {
  const bookingDate = new Date(input.date);
  if (Number.isNaN(bookingDate.getTime())) throw new Error("تاريخ غير صالح");

  const hospital = await prisma.hospital.findUnique({ where: { id: input.hospitalId } });
  if (!hospital || hospital.status !== "ACTIVE") {
    throw new Error("المستشفى غير متاح");
  }

  const booking = await prisma.$transaction(async (tx) => {
    await assertNoConflict(input, bookingDate);

    const created = await tx.booking.create({
      data: {
        reference: generateReference(),
        type: input.type,
        userId,
        hospitalId: input.hospitalId,
        serviceId: input.serviceId,
        medicalTestId: input.medicalTestId,
        doctorId: input.doctorId,
        roomId: input.roomId,
        date: bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        status: "PENDING",
      },
    });

    if (input.type === "ROOM" && input.roomId) {
      await tx.room.update({ where: { id: input.roomId }, data: { status: "RESERVED" } });
    }

    return created;
  });

  await notify({
    userId,
    type: "BOOKING_CREATED",
    title: "تم إنشاء الحجز",
    body: `تم استلام طلب الحجز رقم ${booking.reference} في ${hospital.name}، وسيتم تأكيده قريبًا.`,
    link: "/bookings",
  });

  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  actorId: string,
  cancelReason?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { hospital: true },
  });
  if (!booking) throw new Error("الحجز غير موجود");

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: { status, cancelReason },
    });
    if (
      booking.roomId &&
      (status === "CANCELLED" || status === "REJECTED" || status === "COMPLETED")
    ) {
      await tx.room.update({ where: { id: booking.roomId }, data: { status: "AVAILABLE" } });
    }
    if (booking.roomId && status === "CONFIRMED") {
      await tx.room.update({ where: { id: booking.roomId }, data: { status: "OCCUPIED" } });
    }
    return b;
  });

  const typeMap: Record<string, { type: "BOOKING_CONFIRMED" | "BOOKING_CANCELLED"; title: string }> =
    {
      CONFIRMED: { type: "BOOKING_CONFIRMED", title: "تم تأكيد الحجز" },
      CANCELLED: { type: "BOOKING_CANCELLED", title: "تم إلغاء الحجز" },
      REJECTED: { type: "BOOKING_CANCELLED", title: "تم رفض الحجز" },
    };
  const n = typeMap[status];
  if (n) {
    await notify({
      userId: booking.userId,
      type: n.type,
      title: n.title,
      body: `الحجز رقم ${booking.reference} في ${booking.hospital.name}`,
      link: "/bookings",
    });
  }

  return { updated, actorId };
}
