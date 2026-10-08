import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
};

export async function notify(input: NotifyInput) {
  await prisma.notification.create({ data: input });
}

export async function notifyMany(inputs: NotifyInput[]) {
  if (inputs.length === 0) return;
  await prisma.notification.createMany({ data: inputs });
}

/** إشعار جميع المدراء العامين */
export async function notifySuperAdmins(input: Omit<NotifyInput, "userId">) {
  const admins = await prisma.user.findMany({
    where: { roles: { some: { role: { name: "SUPER_ADMIN" } } }, status: "ACTIVE" },
    select: { id: true },
  });
  await notifyMany(admins.map((a) => ({ ...input, userId: a.id })));
}
