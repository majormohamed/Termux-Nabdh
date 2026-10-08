import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { HospitalRequestsTable } from "@/components/admin/hospital-requests-table";

export const dynamic = "force-dynamic";

export default async function HospitalRequestsPage() {
  await requireRole("SUPER_ADMIN");
  const requests = await prisma.hospitalRequest.findMany({
    include: { hospital: true, documents: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title="طلبات تسجيل المستشفيات">
      <HospitalRequestsTable
        requests={requests.map((r) => ({
          id: r.id,
          status: r.status,
          rejectReason: r.rejectReason,
          changeRequestNote: r.changeRequestNote,
          contactName: r.contactName,
          contactJobTitle: r.contactJobTitle,
          contactPhone: r.contactPhone,
          contactEmail: r.contactEmail,
          contactNationalId: r.contactNationalId,
          createdAt: r.createdAt.toISOString(),
          documents: r.documents.map((d) => ({ id: d.id, kind: d.kind, fileUrl: d.fileUrl, fileName: d.fileName })),
          hospital: {
            name: r.hospital.name,
            tradeName: r.hospital.tradeName,
            type: r.hospital.type,
            licenseNumber: r.hospital.licenseNumber,
            city: r.hospital.city,
            country: r.hospital.country,
            address: r.hospital.address,
            phone: r.hospital.phone,
            email: r.hospital.email,
            website: r.hospital.website,
            description: r.hospital.description,
          },
        }))}
      />
    </AppShell>
  );
}
