import { z } from "zod";

const phoneRegex = /^[+0-9][0-9\s-]{6,19}$/;

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "الاسم الكامل مطلوب (3 أحرف على الأقل)"),
    phone: z.string().regex(phoneRegex, "رقم هاتف غير صالح"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .regex(/[A-Za-z]/, "يجب أن تحتوي على حرف لاتيني")
      .regex(/[0-9]/, "يجب أن تحتوي على رقم"),
    confirmPassword: z.string(),
    birthDate: z.string().min(1, "تاريخ الميلاد مطلوب"),
    gender: z.enum(["MALE", "FEMALE"], { message: "اختر الجنس" }),
    address: z.string().min(3, "العنوان مطلوب"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const hospitalRegisterSchema = z.object({
  name: z.string().min(2, "اسم المستشفى مطلوب"),
  tradeName: z.string().optional(),
  type: z.enum(["GENERAL", "SPECIALIZED", "CLINIC", "MEDICAL_CENTER"]),
  licenseNumber: z.string().min(1, "رقم الترخيص مطلوب"),
  licenseDate: z.string().min(1, "تاريخ الترخيص مطلوب"),
  country: z.string().min(1, "الدولة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().min(3, "العنوان مطلوب"),
  phone: z.string().regex(phoneRegex, "رقم هاتف غير صالح"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  website: z.string().url("رابط غير صالح").optional().or(z.literal("")),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  images: z.array(z.string()).max(10).optional(),
  // المسؤول
  contactName: z.string().min(2, "اسم المسؤول مطلوب"),
  contactJobTitle: z.string().min(1, "وظيفة المسؤول مطلوبة"),
  contactPhone: z.string().regex(phoneRegex, "هاتف المسؤول غير صالح"),
  contactEmail: z.string().email("بريد المسؤول غير صالح"),
  contactNationalId: z.string().min(4, "رقم الهوية مطلوب"),
  // المستندات (روابط بعد الرفع)
  licenseDocUrl: z.string().optional(),
  commercialRecordUrl: z.string().optional(),
  accreditationUrls: z.array(z.string()).optional(),
});

export const bookingCreateSchema = z
  .object({
    type: z.enum(["APPOINTMENT", "ROOM", "LAB_TEST", "RADIOLOGY", "MEDICAL_SERVICE"]),
    hospitalId: z.string().min(1, "اختر المستشفى"),
    serviceId: z.string().optional(),
    medicalTestId: z.string().optional(),
    doctorId: z.string().optional(),
    roomId: z.string().optional(),
    date: z.string().min(1, "اختر التاريخ"),
    startTime: z.string().min(1, "اختر الوقت"),
    endTime: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.type === "APPOINTMENT" && !d.doctorId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اختر الطبيب", path: ["doctorId"] });
    }
    if (d.type === "ROOM" && !d.roomId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اختر الغرفة", path: ["roomId"] });
    }
    if ((d.type === "LAB_TEST" || d.type === "RADIOLOGY") && !d.medicalTestId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "اختر الفحص",
        path: ["medicalTestId"],
      });
    }
    if (d.type === "MEDICAL_SERVICE" && !d.serviceId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اختر الخدمة", path: ["serviceId"] });
    }
  });

export const bookingUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const rejectSchema = z.object({
  reason: z.string().min(3, "سبب الرفض مطلوب"),
});

export const requestChangesSchema = z.object({
  note: z.string().min(3, "اكتب الملاحظات المطلوب تعديلها"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type HospitalRegisterInput = z.infer<typeof hospitalRegisterSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
