import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { notifySuperAdmins } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const email = data.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجّل مسبقًا" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email,
        phone: data.phone,
        passwordHash,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        address: data.address,
        status: "PENDING",
        roles: userRole ? { create: { roleId: userRole.id } } : undefined,
        accountRequests: { create: { status: "PENDING" } },
      },
    });

    await logAudit({ userId: user.id, action: "CREATE_USER", entity: "User", entityId: user.id });
    await notifySuperAdmins({
      type: "ACCOUNT_REGISTERED",
      title: "طلب حساب جديد",
      body: `${user.fullName} سجّل حسابًا جديدًا وينتظر الموافقة.`,
      link: "/admin/account-requests",
    });

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح، بانتظار موافقة الإدارة", id: user.id },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
