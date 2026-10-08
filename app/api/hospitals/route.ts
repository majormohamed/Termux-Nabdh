import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hospitalRegisterSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { notifySuperAdmins } from "@/lib/notifications";
import { getSessionUser } from "@/lib/rbac";

// GET /api/hospitals?search=&city=&type=&service=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const city = searchParams.get("city")?.trim();
  const type = searchParams.get("type")?.trim();
  const service = searchParams.get("service")?.trim();

  const hospitals = await prisma.hospital.findMany({
    where: {
      status: "ACTIVE",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { tradeName: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { doctors: { some: { fullName: { contains: search, mode: "insensitive" } } } },
              { services: { some: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
      ...(city ? { city } : {}),
      ...(type ? { type: type as never } : {}),
      ...(service ? { services: { some: { name: { contains: service, mode: "insensitive" } } } } : {}),
    },
    include: {
      _count: { select: { doctors: true, services: true, rooms: true, reviews: true } },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({ hospitals });
}

// POST /api/hospitals — تسجيل مستشفى جديد (طلب مراجعة)
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(); // اختياري: يمكن التسجيل دون دخول
    const body = await req.json();
    const parsed = hospitalRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const hospital = await prisma.hospital.create({
      data: {
        name: data.name,
        tradeName: data.tradeName,
        type: data.type,
        licenseNumber: data.licenseNumber,
        licenseDate: new Date(data.licenseDate),
        country: data.country,
        city: data.city,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website || undefined,
        description: data.description,
        logoUrl: data.logoUrl,
        images: data.images ?? [],
        status: "PENDING",
        requests: {
          create: {
            status: "PENDING",
            contactName: data.contactName,
            contactJobTitle: data.contactJobTitle,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            contactNationalId: data.contactNationalId,
            documents: {
              create: [
                ...(data.licenseDocUrl
                  ? [{ kind: "LICENSE", fileUrl: data.licenseDocUrl, fileName: "مستند الترخيص" }]
                  : []),
                ...(data.commercialRecordUrl
                  ? [
                      {
                        kind: "COMMERCIAL_RECORD",
                        fileUrl: data.commercialRecordUrl,
                        fileName: "السجل التجاري",
                      },
                    ]
                  : []),
                ...(data.accreditationUrls ?? []).map((url, i) => ({
                  kind: "ACCREDITATION",
                  fileUrl: url,
                  fileName: `مستند اعتماد ${i + 1}`,
                })),
              ],
            },
          },
        },
      },
    });

    await logAudit({
      userId: user?.id,
      action: "CREATE_HOSPITAL",
      entity: "Hospital",
      entityId: hospital.id,
    });
    await notifySuperAdmins({
      type: "HOSPITAL_REGISTERED",
      title: "طلب تسجيل مستشفى جديد",
      body: `المستشفى "${hospital.name}" أرسل طلب تسجيل وينتظر المراجعة.`,
      link: "/admin/hospital-requests",
    });

    return NextResponse.json(
      { message: "تم إرسال طلب التسجيل، بانتظار مراجعة الإدارة", id: hospital.id },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
