import { PrismaClient, Gender, HospitalType, BookingType, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HOSPITAL_PERMISSIONS } from "../lib/permissions";

const prisma = new PrismaClient();

const ROLES = [
  { name: "SUPER_ADMIN", description: "المدير العام" },
  { name: "USER", description: "مستخدم عادي" },
  { name: "HOSPITAL_ADMIN", description: "مدير مستشفى" },
  { name: "RECEPTIONIST", description: "موظف استقبال" },
  { name: "DOCTOR", description: "طبيب" },
  { name: "LAB_STAFF", description: "موظف مختبر" },
  { name: "RADIOLOGY_STAFF", description: "موظف أشعة" },
  { name: "ACCOUNTANT", description: "محاسب" },
];

async function main() {
  console.log("🌱 بدء الـ Seeding...");

  // الأدوار
  for (const role of ROLES) {
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: role });
  }

  // المدير العام التجريبي
  const adminHash = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nabdh.com" },
    update: {},
    create: {
      fullName: "المدير العام",
      email: "admin@nabdh.com",
      phone: "+966500000001",
      passwordHash: adminHash,
      gender: Gender.MALE,
      status: "ACTIVE",
      roles: {
        create: { role: { connect: { name: "SUPER_ADMIN" } } },
      },
    },
  });
  console.log("✅ المدير العام:", admin.email);

  // مستخدمون تجريبيون
  const userHash = await bcrypt.hash("User@123456", 12);
  const demoUsers = [];
  const names = ["أحمد محمد", "سارة علي", "خالد عبدالله", "فاطمة حسن", "عمر يوسف"];
  for (let i = 0; i < names.length; i++) {
    const u = await prisma.user.upsert({
      where: { email: `user${i + 1}@nabdh.com` },
      update: {},
      create: {
        fullName: names[i],
        email: `user${i + 1}@nabdh.com`,
        phone: `+9665000001${i}${i}`,
        passwordHash: userHash,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        birthDate: new Date(1990 + i, i, 15),
        address: "الرياض",
        status: i === 4 ? "PENDING" : "ACTIVE",
        roles: { create: { role: { connect: { name: "USER" } } } },
        ...(i === 4 ? { accountRequests: { create: { status: "PENDING" } } } : {}),
      },
    });
    demoUsers.push(u);
  }
  console.log("✅ مستخدمون تجريبيون:", demoUsers.length);

  // مستشفيات
  const hospitalsData = [
    {
      name: "مستشفى الشفاء التخصصي",
      tradeName: "الشفاء",
      type: HospitalType.GENERAL,
      city: "الرياض",
      country: "السعودية",
      address: "حي النرجس، طريق الملك فهد",
      phone: "+966112345678",
      email: "info@shifa.example.com",
      description: "مستشفى عام متكامل يقدم خدمات الطوارئ والعيادات الخارجية والعمليات.",
      workingHours: "24 ساعة",
      rating: 4.5,
      status: "ACTIVE" as const,
    },
    {
      name: "مركز النور الطبي",
      type: HospitalType.MEDICAL_CENTER,
      city: "جدة",
      country: "السعودية",
      address: "حي الروضة",
      phone: "+966126543210",
      email: "info@alnoor.example.com",
      description: "مركز طبي متخصص في طب الأسرة والأسنان والجلدية.",
      workingHours: "9ص - 10م",
      rating: 4.2,
      status: "ACTIVE" as const,
    },
    {
      name: "مستشفى الحياة",
      type: HospitalType.SPECIALIZED,
      city: "الدمام",
      country: "السعودية",
      address: "حي الشاطئ",
      phone: "+966138889900",
      email: "info@alhayat.example.com",
      description: "مستشفى متخصص في القلب والأوعية الدموية.",
      workingHours: "24 ساعة",
      rating: 4.7,
      status: "PENDING" as const,
    },
  ];

  for (const h of hospitalsData) {
    const hospital = await prisma.hospital.create({ data: h });

    await prisma.hospitalPermission.createMany({
      data: HOSPITAL_PERMISSIONS.map((p) => ({ hospitalId: hospital.id, permission: p })),
      skipDuplicates: true,
    });

    if (h.status === "PENDING") {
      await prisma.hospitalRequest.create({
        data: {
          hospitalId: hospital.id,
          status: "PENDING",
          contactName: "م. سلطان الحربي",
          contactJobTitle: "المدير التنفيذي",
          contactPhone: "+966555555555",
          contactEmail: "ceo@alhayat.example.com",
          contactNationalId: "1000000003",
        },
      });
    }

    // أقسام
    const dept1 = await prisma.department.create({
      data: { hospitalId: hospital.id, name: "الباطنية", description: "قسم الطب الباطني" },
    });
    const dept2 = await prisma.department.create({
      data: { hospitalId: hospital.id, name: "الأطفال", description: "قسم طب الأطفال" },
    });

    // أطباء
    await prisma.doctor.createMany({
      data: [
        { hospitalId: hospital.id, departmentId: dept1.id, fullName: "د. منى السالم", specialty: "باطنية" },
        { hospitalId: hospital.id, departmentId: dept2.id, fullName: "د. بدر القحطاني", specialty: "أطفال" },
        { hospitalId: hospital.id, departmentId: dept1.id, fullName: "د. ليلى عثمان", specialty: "قلب" },
      ],
    });

    // خدمات
    await prisma.service.createMany({
      data: [
        { hospitalId: hospital.id, departmentId: dept1.id, name: "استشارة عامة", price: 150, durationMin: 30 },
        { hospitalId: hospital.id, departmentId: dept2.id, name: "كشف أطفال", price: 120, durationMin: 20 },
        { hospitalId: hospital.id, name: "تطعيمات", price: 80, durationMin: 15 },
      ],
    });

    // فحوصات
    await prisma.medicalTest.createMany({
      data: [
        { hospitalId: hospital.id, name: "تحليل دم شامل CBC", category: "LAB", price: 60 },
        { hospitalId: hospital.id, name: "سكر صائم", category: "LAB", price: 30 },
        { hospitalId: hospital.id, name: "أشعة سينية X-Ray", category: "RADIOLOGY", price: 120 },
        { hospitalId: hospital.id, name: "رنين مغناطيسي MRI", category: "RADIOLOGY", price: 900 },
      ],
    });

    // غرف
    await prisma.room.createMany({
      data: [
        { hospitalId: hospital.id, number: "101", type: "مفردة", floor: 1, capacity: 1, pricePerDay: 400 },
        { hospitalId: hospital.id, number: "102", type: "مزدوجة", floor: 1, capacity: 2, pricePerDay: 250 },
        { hospitalId: hospital.id, number: "201", type: "VIP", floor: 2, capacity: 1, pricePerDay: 900 },
      ],
    });
  }
  console.log("✅ 3 مستشفيات مع أقسام وأطباء وخدمات وفحوصات وغرف");

  // حجوزات تجريبية
  const firstHospital = await prisma.hospital.findFirst({ where: { status: "ACTIVE" } });
  const doctor = await prisma.doctor.findFirst({ where: { hospitalId: firstHospital?.id } });
  const service = await prisma.service.findFirst({ where: { hospitalId: firstHospital?.id } });

  if (firstHospital && doctor && service) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await prisma.booking.create({
      data: {
        reference: "NBD-DEMO-001",
        type: BookingType.APPOINTMENT,
        userId: demoUsers[0].id,
        hospitalId: firstHospital.id,
        doctorId: doctor.id,
        serviceId: service.id,
        date: tomorrow,
        startTime: "10:00",
        status: BookingStatus.CONFIRMED,
        notes: "حجز تجريبي",
      },
    });
  }
  console.log("✅ حجوزات تجريبية");

  // إعدادات النظام
  await prisma.systemSetting.upsert({
    where: { key: "site_name" },
    update: {},
    create: { key: "site_name", value: "نبض" },
  });

  console.log("🎉 تم الـ Seeding بنجاح");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
