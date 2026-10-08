import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صالحة", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "الرابط غير صالح أو منتهي الصلاحية" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAudit({ userId: record.userId, action: "RESET_PASSWORD", entity: "User", entityId: record.userId });

  return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
}
