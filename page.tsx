import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AccountRequestsTable } from "@/components/admin/account-requests-table";

export const dynamic = "force-dynamic";

export default async function AccountRequestsPage() {
  await requireRole("SUPER_ADMIN");
  const requests = await prisma.accountRequest.findMany({
    include: {
      user: {
        select: { fullName: true, email: true, phone: true, gender: true, birthDate: true, address: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title="طلبات الحسابات">
      <AccountRequestsTable
        requests={requests.map((r) => ({
          id: r.id,
          status: r.status,
          rejectReason: r.rejectReason,
          createdAt: r.createdAt.toISOString(),
          user: {
            fullName: r.user.fullName,
            email: r.user.email,
            phone: r.user.phone,
            gender: r.user.gender,
            birthDate: r.user.birthDate?.toISOString() ?? null,
            address: r.user.address,
          },
        }))}
      />
    </AppShell>
  );
}
