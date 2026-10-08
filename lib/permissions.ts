// أدوار النظام
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  USER: "USER",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  RECEPTIONIST: "RECEPTIONIST",
  DOCTOR: "DOCTOR",
  LAB_STAFF: "LAB_STAFF",
  RADIOLOGY_STAFF: "RADIOLOGY_STAFF",
  ACCOUNTANT: "ACCOUNTANT",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: "المدير العام",
  USER: "مستخدم",
  HOSPITAL_ADMIN: "مدير مستشفى",
  RECEPTIONIST: "موظف استقبال",
  DOCTOR: "طبيب",
  LAB_STAFF: "موظف مختبر",
  RADIOLOGY_STAFF: "موظف أشعة",
  ACCOUNTANT: "محاسب",
};

// صلاحيات المستشفيات (يشغّلها/يوقفها المدير العام لكل مستشفى)
export const HOSPITAL_PERMISSIONS = [
  "MANAGE_PROFILE",
  "MANAGE_USERS",
  "MANAGE_DOCTORS",
  "MANAGE_DEPARTMENTS",
  "MANAGE_SERVICES",
  "MANAGE_ROOMS",
  "MANAGE_APPOINTMENTS",
  "MANAGE_PATIENTS",
  "MANAGE_LAB",
  "MANAGE_RADIOLOGY",
  "VIEW_REPORTS",
  "MANAGE_BILLING",
] as const;

export type HospitalPermissionKey = (typeof HOSPITAL_PERMISSIONS)[number];

export const HOSPITAL_PERMISSION_LABELS: Record<HospitalPermissionKey, string> = {
  MANAGE_PROFILE: "إدارة الملف التعريفي",
  MANAGE_USERS: "إدارة المستخدمين",
  MANAGE_DOCTORS: "إدارة الأطباء",
  MANAGE_DEPARTMENTS: "إدارة الأقسام",
  MANAGE_SERVICES: "إدارة الخدمات",
  MANAGE_ROOMS: "إدارة الغرف",
  MANAGE_APPOINTMENTS: "إدارة المواعيد",
  MANAGE_PATIENTS: "إدارة المرضى",
  MANAGE_LAB: "إدارة المختبر",
  MANAGE_RADIOLOGY: "إدارة الأشعة",
  VIEW_REPORTS: "عرض التقارير",
  MANAGE_BILLING: "إدارة الفواتير",
};
