import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole("SUPER_ADMIN");
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title="إدارة المستخدمين">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell dir="ltr">{u.email}</TableCell>
                <TableCell dir="ltr">{u.phone}</TableCell>
                <TableCell>
                  {u.roles.map((r) => ROLE_LABELS[r.role.name as keyof typeof ROLE_LABELS] ?? r.role.name).join("، ")}
                </TableCell>
                <TableCell><StatusBadge value={u.status} /></TableCell>
                <TableCell>{formatDate(u.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
