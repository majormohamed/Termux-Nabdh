import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PermissionsManager } from "@/components/admin/permissions-manager";

export const dynamic = "force-dynamic";

export default async function HospitalPermissionsPage() {
  await requireRole("SUPER_ADMIN");
  const hospitals = await prisma.hospital.findMany({
    where: { status: { in: ["ACTIVE", "SUSPENDED"] } },
    include: { permissions: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell title="صلاحيات المستشفيات">
      <PermissionsManager
        hospitals={hospitals.map((h) => ({
          id: h.id,
          name: h.name,
          permissions: h.permissions.map((p) => ({ permission: p.permission, enabled: p.enabled })),
        }))}
      />
    </AppShell>
  );
}
