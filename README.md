# نبض | Nabd

**رعاية أقرب، حجز أسهل** — نظام متكامل لإدارة المستشفيات والخدمات الطبية والحجوزات.

## الميزات

- 🔐 **مصادقة كاملة**: تسجيل، دخول، استعادة كلمة مرور، جلسات JWT آمنة، تشفير bcrypt.
- 🛡️ **RBAC + صلاحيات**: 8 أدوار (مدير عام، مستخدم، مدير مستشفى، استقبال، طبيب، مختبر، أشعة، محاسب) مع حماية Backend في كل API.
- ✅ **اعتماد الحسابات**: التسجيل → حالة `PENDING` → موافقة/رفض من المدير مع سبب الرفض.
- 🏥 **تسجيل المستشفيات**: نموذج كامل مع بيانات المسؤول والمستندات، وسير مراجعة (قبول/رفض/طلب تعديل).
- 🔑 **صلاحيات مستشفيات مرنة**: 12 صلاحية يشغّلها المدير العام لكل مستشفى.
- 📅 **نظام حجوزات**: مواعيد، غرف، فحوصات مختبر، أشعة، خدمات — مع منع الحجز المزدوج داخل Transaction.
- 🔔 **إشعارات**: لحظية لكل الأحداث المهمة مع جرس إشعارات في الواجهة.
- 📜 **Audit Logs**: تسجيل كل العمليات الحساسة مع IP.
- 📊 **لوحات تحكم**: مدير عام (إحصاءات + رسوم بيانية)، مستشفى، مستخدم.
- 🌐 **واجهة عربية RTL** كاملة، Responsive (Mobile First).

## التقنيات

| المجال | التقنية |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Lucide |
| DB | PostgreSQL + Prisma ORM |
| Auth | NextAuth v4 (Credentials, JWT) |
| Validation | Zod + React Hook Form |
| Charts | Recharts |
| CI | GitHub Actions |

## المتطلبات

- Node.js 20+
- PostgreSQL 14+

## التشغيل محليًا

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إعداد البيئة
cp .env.example .env
# عدّل DATABASE_URL و AUTH_SECRET داخل .env

# 3. قاعدة البيانات
npm run db:deploy                    # تطبيق migration الموجودة
npm run db:seed                       # بيانات تجريبية

# 4. التشغيل
npm run dev
# http://localhost:3000
```

## متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط PostgreSQL |
| `AUTH_SECRET` | سر تشفير الجلسات (سلسلة عشوائية طويلة) |
| `NEXTAUTH_URL` | رابط التطبيق |
| `STORAGE_URL` / `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | تخزين الملفات (اختياري) |

## الحسابات التجريبية (بعد الـ Seed)

| الحساب | كلمة المرور | الدور |
|---|---|---|
| `admin@nabdh.com` | `Admin@123456` | مدير عام |
| `user1@nabdh.com` … `user4@nabdh.com` | `User@123456` | مستخدمون نشطون |
| `user5@nabdh.com` | `User@123456` | طلب قيد المراجعة |

## سكربتات

```bash
npm run dev          # تطوير
npm run build        # بناء الإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run db:migrate   # Prisma migrate dev
npm run db:deploy    # migrate deploy (إنتاج)
npm run db:seed      # بيانات تجريبية
npm run db:studio    # Prisma Studio
```

## النشر (Production)

1. أنشئ قاعدة PostgreSQL (مثل Neon / Supabase / RDS).
2. اضبط متغيرات البيئة على منصة الاستضافة (Vercel مناسب مباشرة).
3. نفّذ `npm run db:deploy` ثم (اختياريًا) `npm run db:seed`.
4. انشر: `npm run build && npm run start` أو ادفع إلى GitHub واربطه بـ Vercel.

## رفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# أنشئ مستودعًا فارغًا باسم nabdh على GitHub ثم:
git remote add origin https://github.com/<username>/nabdh.git
git push -u origin main
```

## بنية المشروع

```
app/            صفحات App Router + API routes
components/     مكونات UI ولوحات التحكم
lib/            prisma, auth, rbac, audit, notifications, validations
services/       منطق الأعمال (الحجوزات)
hooks/          خطافات React
types/          تعريفات TypeScript
prisma/         schema.prisma + seed.ts
middleware.ts   حماية المسارات
```

## ملاحظات أمنية

- لا تُرفع ملفات `.env` أبدًا (موجودة في `.gitignore`).
- كلمات المرور تُخزّن مشفّرة بـ bcrypt فقط.
- كل عمليات الإدارة محمية في الـ Backend وليس مجرد إخفاء في الواجهة.
