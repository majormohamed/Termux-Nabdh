import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function logAudit({ userId, action, entity, entityId, metadata }: AuditInput) {
  let ipAddress: string | undefined;
  try {
    const h = await headers();
    ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;
  } catch {
    // خارج سياق الطلب (مثل seed)
  }
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        entity,
        entityId,
        metadata: (metadata ?? undefined) as never,
        ipAddress,
      },
    });
  } catch (e) {
    console.error("AuditLog failed:", e);
  }
}
