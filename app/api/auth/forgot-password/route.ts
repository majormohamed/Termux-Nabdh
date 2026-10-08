import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // لا نكشف وجود الحساب من عدمه
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // ساعة واحدة
      },
    });
    // في الإنتاج: أرسل الرابط عبر البريد. في التطوير نعيده للاختبار.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        message: "تم إنشاء رابط إعادة التعيين",
        resetUrl: `/reset-password?token=${token}`,
      });
    }
  }

  return NextResponse.json({
    message: "إذا كان البريد مسجلًا، ستصلك رسالة إعادة تعيين كلمة المرور",
  });
}
